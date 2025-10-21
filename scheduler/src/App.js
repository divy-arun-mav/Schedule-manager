import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [currentDay, setCurrentDay] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState('Checking...');

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const scheduleData = {
    time: ['8am', '8.30am', '9am', '10am', '11am', '12am', '1pm', '2pm', '3pm', '4pm',
      '5pm', '5.30pm', '6-6.15pm', '7pm', '8pm', '9pm', '9.30pm', '10pm', '11pm', '12pm'],
    Monday: [
      'wakeup and get ready',
      'gym(chest)',
      'gym',
      'return home bath',
      'go to college',
      'college',
      'college',
      'college',
      'college',
      'college',
      '15-30mins rest and snacks',
      'workshop(skip with rest if not imp)',
      'Leave for shop',
      'Shop',
      'Shop',
      'Shop',
      'Shop / Leave if no customers',
      'Shop / Dinner / Coding / Leetcode / Workshop(only if too much imp)',
      'Shop / Dinner/ Coding / Leetcode / Assignments / Experiments',
      'Sleep / Keep fighting my man'
    ],
    Tuesday: [
      'wakeup and get ready',
      'gym(biceps)',
      'gym',
      'return home bath',
      'check for assignments and college work',
      'Leetcode / Coding / Workshop',
      'Workshop / Lunch',
      'Leetcode / Coding / Workshop',
      'Leetcode / Coding / Workshop',
      'Leetcode / Coding / Workshop / Rest',
      'Snacks(must have whey)',
      'Workshop if any imp work else rest',
      'Leave for shop',
      'Shop',
      'Shop',
      'Shop',
      'Shop / Leave if no customers',
      'Shop / Dinner / Coding / Leetcode / Workshop(only if too much imp)',
      'Shop / Dinner/ Coding / Leetcode / Assignments / Experiments',
      'Sleep / Keep fighting my man'
    ],
    Wednesday: [
      'wakeup and get ready',
      'gym(back)',
      'gym',
      'return home bath',
      'go to college',
      'college',
      'college',
      'college',
      'college',
      'college',
      '15-30mins rest and snacks',
      'workshop(skip with rest if not imp)',
      'Leave for shop',
      'Shop',
      'Shop',
      'Shop',
      'Shop / Leave if no customers',
      'Shop / Dinner / Coding / Leetcode / Workshop(only if too much imp)',
      'Shop / Dinner/ Coding / Leetcode / Assignments / Experiments',
      'Sleep / Keep fighting my man'
    ],
    Thursday: [
      'wakeup and get ready',
      'gym(triceps)',
      'gym',
      'return home bath',
      'go to workshop / market',
      'go to workshop / market',
      'Lunch / go to workshop / market',
      'Leetcode / Coding / Market',
      'Leetcode / Coding / Market',
      'Leetcode / Coding / Market',
      'Snacks',
      'Family Time / Me Time',
      'Family Time / Me Time',
      'Family Time / Me Time',
      'Family Time / Me Time',
      'Family Time / Me Time',
      'Family Time / Me Time',
      'Family Time / Me Time',
      'Family Time / Me Time',
      'Sleep / Keep fighting my man'
    ],
    Friday: [
      'wakeup and get ready',
      'gym(legs)',
      'gym',
      'return home bath',
      'College work / order reviews / workshop / leetcode / coding',
      'College work / order reviews / workshop / leetcode / coding',
      'Lunch / workshop',
      'College work / order reviews / workshop / leetcode / coding',
      'College work / order reviews / workshop / leetcode / coding',
      'College work / order reviews / workshop / leetcode / coding / Rest',
      'Snacks',
      'workshop(skip with rest if not imp)',
      'Leave for shop',
      'Shop',
      'Shop',
      'Shop',
      'Shop / Leave if no customers',
      'Shop / Dinner / Coding / Leetcode / Workshop(only if too much imp)',
      'Shop / Dinner/ Coding / Leetcode / Assignments / Experiments',
      'Sleep / Keep fighting my man'
    ],
    Saturday: [
      'wakeup and get ready',
      'gym(core)',
      'gym',
      'return home bath',
      'Free time',
      'Free time',
      'Free time',
      'Free time',
      'Free time',
      'Free time',
      'Snacks',
      'workshop(skip with rest if not imp)',
      'Leave for shop',
      'Shop',
      'Shop',
      'Shop',
      'Shop / Leave if no customers',
      'Shop / Dinner / Coding / Leetcode / Workshop(only if too much imp)',
      'Shop / Dinner/ Coding / Leetcode / Assignments / Experiments',
      'Sleep / Keep fighting my man'
    ],
    Sunday: [
      'rest',
      'rest',
      'wakeup, get ready',
      'check for assignments and college work',
      'Leetcode / Coding / Workshop',
      'Leetcode / Coding / Workshop',
      'Workshop / Lunch',
      'Leetcode / Coding / Workshop',
      'Leetcode / Coding / Workshop',
      'Leetcode / Coding / Workshop / Rest',
      'Snacks',
      'workshop(skip with rest if not imp)',
      'Leave for shop',
      'Shop',
      'Shop',
      'Shop',
      'Shop / Leave if no customers',
      'Shop / Dinner / Coding / Leetcode / Workshop(only if too much imp)',
      'Shop / Dinner/ Coding / Leetcode / Assignments / Experiments',
      'Sleep / Keep fighting my man'
    ]
  };

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 60000);

    // Automatically subscribe to push notifications on mount
    autoSubscribeToPush();

    return () => clearInterval(interval);
  }, []);

  const updateTime = () => {
    const now = new Date();
    const day = days[now.getDay()];
    setCurrentDay(day);

    const hours = now.getHours();
    const minutes = now.getMinutes();
    setCurrentTime(`${hours}:${minutes < 10 ? '0' + minutes : minutes}`);

    const todaySchedule = scheduleData.time.map((time, index) => ({
      time: time,
      task: scheduleData[day][index]
    }));
    setSchedule(todaySchedule);
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const autoSubscribeToPush = async () => {
    try {
      setSubscriptionStatus('Setting up notifications...');

      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        setSubscriptionStatus('❌ Service Workers not supported on this browser');
        console.error('Service Workers not supported');
        return;
      }

      if (!('PushManager' in window)) {
        setSubscriptionStatus('❌ Push notifications not supported on this browser');
        console.error('Push notifications not supported');
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered');

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        setSubscription(existingSubscription);
        setPushEnabled(true);
        setSubscriptionStatus('✅ Push notifications active');
        return;
      }

      // Request notification permission automatically
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        setSubscriptionStatus('⚠️ Notification permission denied. Please enable in browser settings.');
        console.log('Notification permission denied');
        return;
      }

      // Get VAPID public key from server
      const response = await fetch(`${API_URL}/api/vapid-public-key`);

      if (!response.ok) {
        throw new Error('Failed to fetch VAPID key. Make sure server is running.');
      }

      const { publicKey } = await response.json();

      // Subscribe to push notifications
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Send subscription to server
      const subscribeResponse = await fetch(`${API_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pushSubscription)
      });

      if (!subscribeResponse.ok) {
        throw new Error('Failed to save subscription on server');
      }

      setSubscription(pushSubscription);
      setPushEnabled(true);
      setSubscriptionStatus('✅ Push notifications active');
      console.log('Successfully subscribed to push notifications');

    } catch (error) {
      console.error('Error auto-subscribing to push:', error);
      setSubscriptionStatus(`❌ Failed to enable notifications: ${error.message}`);
    }
  };

  const testNotification = async () => {
    try {
      const response = await fetch(`${API_URL}/api/test-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'Test Reminder',
          time: currentTime
        })
      });

      if (response.ok) {
        alert('✅ Test notification sent! Check your notifications.');
      } else {
        alert('❌ Failed to send notification. Make sure the server is running.');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const getCurrentTask = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let task of schedule) {
      const taskTime = task.time;
      if (taskTime.includes('-')) continue;

      let hour = parseInt(taskTime);
      let minute = 0;

      if (taskTime.includes('.')) {
        minute = parseInt(taskTime.split('.')[1].replace('am', '').replace('pm', ''));
      }

      if (taskTime.includes('pm') && hour !== 12) hour += 12;
      if (taskTime.includes('am') && hour === 12) hour = 0;

      if (hour === currentHour && Math.abs(currentMinute - minute) < 30) {
        return task;
      }
    }
    return null;
  };

  const currentTask = getCurrentTask();

  return (
    <div className="App">
      <header className="header">
        <h1>📅 Daily Schedule Tracker</h1>
        <div className="current-info">
          <p className="day">{currentDay}</p>
          <p className="time">{currentTime}</p>
        </div>
      </header>

      {currentTask && (
        <div className="current-task">
          <h2>Current Task</h2>
          <p className="task-time">{currentTask.time}</p>
          <p className="task-name">{currentTask.task}</p>
        </div>
      )}

      <div className="schedule-container">
        <h2>Today's Schedule</h2>
        <div className="schedule-grid">
          {schedule.map((item, index) => (
            <div key={index} className="schedule-item">
              <div className="time-badge">{item.time}</div>
              <div className="task">{item.task || 'Free time'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="notification-setup">
        <h3>🔔 Notification Status</h3>
        <div className="status-container">
          <p className={`status-message ${pushEnabled ? 'success' : 'info'}`}>
            {subscriptionStatus}
          </p>
          {pushEnabled && (
            <button onClick={testNotification} className="test-btn">
              🧪 Test Notification
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
