import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { webpush } from '@/lib/vapid';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, url } = await request.json();

    // Foydalanuvchining push subscription ma'lumotlarini olish
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', user.id);

    if (!subscriptions?.length) {
      return NextResponse.json({ error: 'No push subscription found' }, { status: 404 });
    }

    // Har bir subscription uchun push notification yuborish
    const pushPromises = subscriptions.map(async ({ subscription }) => {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title,
            body,
            url
          })
        );
      } catch (error) {
        console.error('Error sending push notification:', error);
        // Agar subscription endi ishlamayotgan bo'lsa, uni o'chirish
        if (error.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('subscription', subscription);
        }
      }
    });

    await Promise.all(pushPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in push notification route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 