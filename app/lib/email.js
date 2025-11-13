import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDailyHabitReminder(user, habits) {
  const dashboardUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://smart-habbit-tracker.vercel.app';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Habit Reminder</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">🎯 Daily Habit Check-In</h1>
                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Time to build your consistency!</p>
                  </td>
                </tr>
                
                <!-- Greeting -->
                <tr>
                  <td style="padding: 30px 30px 20px 30px;">
                    <h2 style="margin: 0 0 10px 0; color: #1a202c; font-size: 24px;">Hey ${user.displayName || 'there'}! 👋</h2>
                    <p style="margin: 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                      It's time for your daily habit check-in. Here are your habits for today:
                    </p>
                  </td>
                </tr>
                
                <!-- Habits List -->
                <tr>
                  <td style="padding: 0 30px 30px 30px;">
                    ${habits.map(habit => `
                      <div style="background: linear-gradient(135deg, ${habit.color}15 0%, ${habit.color}05 100%); border-left: 4px solid ${habit.color}; padding: 20px; margin-bottom: 15px; border-radius: 8px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="vertical-align: top;">
                              <h3 style="margin: 0 0 5px 0; color: #2d3748; font-size: 18px; font-weight: 600;">${habit.habitName}</h3>
                              <p style="margin: 0; color: #718096; font-size: 14px;">${habit.description || 'Keep up the great work!'}</p>
                            </td>
                            <td align="right" style="vertical-align: middle; padding-left: 20px;">
                              <div style="background: ${habit.color}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; white-space: nowrap;">
                                ${habit.category}
                              </div>
                            </td>
                          </tr>
                        </table>
                      </div>
                    `).join('')}
                  </td>
                </tr>
                
                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 30px 40px 30px; text-align: center;">
                    <a href="${dashboardUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                      🚀 Go to Dashboard
                    </a>
                    <p style="margin: 20px 0 0 0; color: #718096; font-size: 14px;">
                      Track your progress and maintain your streaks!
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px;">
                      You're receiving this because you enabled daily reminders.
                    </p>
                    <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                      <a href="${dashboardUrl}/dashboard/settings" style="color: #667eea; text-decoration: none;">Manage preferences</a> · 
                      <a href="${dashboardUrl}" style="color: #667eea; text-decoration: none;">Habit Tracker</a>
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Habit Tracker <onboarding@resend.dev>', // Change to your verified domain
      to: [user.email],
      subject: `🎯 Daily Habit Reminder - ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Email send error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
