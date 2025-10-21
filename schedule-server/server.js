const express = require('express');
const webpush = require('web-push');
const cron = require('node-cron');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Store subscriptions (in production, use a database)
let subscriptions = [];

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const scheduleData = {
  time: ['8:00', '8:30', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
    '17:00', '17:30', '18:00', '19:00', '20:00', '21:00', '21:30', '22:00', '23:00', '0:00'],
  Monday: ['wakeup and get ready', 'gym(chest)', '-', 'return home bath', 'go to college',
    'college', 'college', 'college', 'college', 'college', '15-30mins rest and snacks',
    'workshop(skip with rest if not imp)', 'Leave for shop', 'Shop', 'Shop', 'Shop',
    'Shop / Leave if no customers', 'Shop / Dinner / Coding / Leetcode / Workshop',
    'Shop / Dinner/ Coding / Leetcode / Assignments', 'Sleep / Keep fighting my man'],
  Tuesday: ['wakeup and get ready', 'gym(biceps)', '-', 'return home bath',
    'check for assignments and college work', 'Leetcode / Coding / Workshop',
    'Workshop / Lunch', 'Leetcode / Coding / Workshop', 'Leetcode / Coding / Workshop',
    'Leetcode / Coding / Workshop / Rest', 'Snacks(must have whey)',
    'Workshop if any imp work else rest', 'Leave for shop', 'Shop', 'Shop', 'Shop',
    'Shop / Leave if no customers', 'Shop / Dinner / Coding / Leetcode / Workshop',
    'Shop / Dinner/ Coding / Leetcode / Assignments', 'Sleep / Keep fighting my man'],
  Wednesday: ['wakeup and get ready', 'gym(back)', '-', 'return home bath', 'go to college',
    'college', 'college', 'college', 'college', 'college', '15-30mins rest and snacks',
    'workshop(skip with rest if not imp)', 'Leave for shop', 'Shop', 'Shop', 'Shop',
    'Shop / Leave if no customers', 'Shop / Dinner / Coding / Leetcode / Workshop',
    'Shop / Dinner/ Coding / Leetcode / Assignments', 'Sleep / Keep fighting my man'],
  Thursday: ['wakeup and get ready', 'gym(triceps)', '-', 'return home bath',
    'go to workshop / market', 'go to workshop / market', 'Lunch / go to workshop / market',
    'Leetcode / Coding / Market', 'Leetcode / Coding / Market', 'Leetcode / Coding / Market',
    'Snacks', 'Family Time / Me Time', 'Family Time / Me Time', 'Family Time / Me Time',
    'Family Time / Me Time', 'Family Time / Me Time', 'Family Time / Me Time',
    'Family Time / Me Time', 'Family Time / Me Time', 'Sleep / Keep fighting my man'],
  Friday: ['wakeup and get ready', 'gym(legs)', '-', 'return home bath',
    'College work / order reviews / workshop / leetcode / coding',
    'College work / order reviews / workshop / leetcode / coding', 'Lunch / workshop',
    'College work / order reviews / workshop / leetcode / coding',
    'College work / order reviews / workshop / leetcode / coding',
    'College work / order reviews / workshop / leetcode / coding / Rest', 'Snacks',
    'workshop(skip with rest if not imp)', 'Leave for shop', 'Shop', 'Shop', 'Shop',
    'Shop / Leave if no customers', 'Shop / Dinner / Coding / Leetcode / Workshop',
    'Shop / Dinner/ Coding / Leetcode / Assignments', 'Sleep / Keep fighting my man'],
  Saturday: ['wakeup and get ready', 'gym(core)', '-', 'return home bath', '', '', '', '', '',
    '', 'Snacks', 'workshop(skip with rest if not imp)', 'Leave for shop', 'Shop',
    'Shop', 'Shop', 'Shop / Leave if no customers',
    'Shop / Dinner / Coding / Leetcode / Workshop',
    'Shop / Dinner/ Coding / Leetcode / Assignments', 'Sleep / Keep fighting my man'],
  Sunday: ['rest', 'rest', 'wakeup, get ready', 'check for assignments and college work',
    'Leetcode / Coding / Workshop', 'Leetcode / Coding / Workshop', 'Workshop / Lunch',
    'Leetcode / Coding / Workshop', 'Leetcode / Coding / Workshop',
    'Leetcode / Coding / Workshop / Rest', 'Snacks', 'workshop(skip with rest if not imp)',
    'Leave for shop', 'Shop', 'Shop', 'Shop', 'Shop / Leave if no customers',
    'Shop / Dinner / Coding / Leetcode / Workshop',
    'Shop / Dinner/ Coding / Leetcode / Assignments', 'Sleep / Keep fighting my man']
};

// Send push notification to all subscribers
const sendPushNotification = async (task, time) => {
  const payload = JSON.stringify({
    notification: {
      title: '⏰ Task Reminder',
      body: `${time} - ${task}`,
      icon: '/icon.png',
      badge: '/badge.png',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        { action: 'done', title: 'Mark as Done' },
        { action: 'snooze', title: 'Snooze 10 min' }
      ]
    }
  });

  console.log(`Sending notification: ${task} at ${time}`);
  console.log(`Active subscriptions: ${subscriptions.length}`);

  // Send to all subscribers
  const sendPromises = subscriptions.map(subscription => {
    return webpush.sendNotification(subscription, payload)
      .catch(error => {
        console.error('Error sending notification:', error);
        // Remove invalid subscriptions
        if (error.statusCode === 404 || error.statusCode === 410) {
          subscriptions = subscriptions.filter(sub => sub !== subscription);
        }
      });
  });

  await Promise.all(sendPromises);
};

// Schedule notifications for each time slot
const scheduleTasks = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  scheduleData.time.forEach((time, index) => {
    const [hour, minute] = time.split(':');

    // Run every day at the specified time
    cron.schedule(`${minute} ${hour} * * *`, () => {
      const now = new Date();
      const currentDay = days[now.getDay()];
      const task = scheduleData[currentDay][index];

      if (task && task !== '-' && task !== '') {
        console.log(`⏰ Scheduled task triggered: ${task} at ${time}`);
        sendPushNotification(task, time);
      }
    });

    console.log(`✓ Scheduled: ${time} (${hour}:${minute})`);
  });
};

// API Endpoints

// Get VAPID public key
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// Subscribe to push notifications
app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;

  // Check if already subscribed
  const exists = subscriptions.find(sub =>
    sub.endpoint === subscription.endpoint
  );

  if (!exists) {
    subscriptions.push(subscription);
    console.log('New subscription added. Total:', subscriptions.length);
  }

  res.status(201).json({ success: true });
});

// Unsubscribe from push notifications
app.post('/api/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
  console.log('Subscription removed. Total:', subscriptions.length);
  res.json({ success: true });
});

// Test notification endpoint
app.post('/api/test-notification', async (req, res) => {
  try {
    await sendPushNotification('Test Task', new Date().toLocaleTimeString());
    res.json({ success: true, message: 'Test notification sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current task
app.get('/api/current-task', (req, res) => {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[now.getDay()];
  const currentHour = now.getHours();

  let closestIndex = 0;
  scheduleData.time.forEach((time, index) => {
    const [hour] = time.split(':').map(Number);
    if (currentHour >= hour) {
      closestIndex = index;
    }
  });

  res.json({
    day: currentDay,
    time: scheduleData.time[closestIndex],
    task: scheduleData[currentDay][closestIndex]
  });
});

// Initialize scheduled tasks
scheduleTasks();

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log('✓ Push notification scheduler initialized');
  console.log(`✓ VAPID Public Key: ${vapidKeys.publicKey.substring(0, 20)}...`);
});
