import webpush from 'web-push';

// VAPID keys - bu keylarni .env faylida saqlash kerak
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
  'mailto:karimovahmadjon001@gmail.com', // O'zingizning email manzilingiz
  vapidKeys.publicKey!,
  vapidKeys.privateKey!
);

export { webpush, vapidKeys }; 