
package com.yourname.kiyara;

import android.app.Service;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;
import android.speech.tts.TextToSpeech;
import android.util.Log;

import java.util.Calendar;
import java.util.Locale;

public class KiyaraSubconsciousService extends Service {

    private static final String TAG = "KiyaraSubconscious";
    private Handler handler = new Handler();
    private TextToSpeech tts;
    private boolean isTtsInitialized = false;

    private Runnable subconsciousThought = new Runnable() {
        @Override
        public void run() {
            Log.d(TAG, "Kiyara is thinking...");
            
            // Get current time
            Calendar cal = Calendar.getInstance();
            int hour = cal.get(Calendar.HOUR_OF_DAY);

            // Let's have a thought in the morning
            if (hour == 8) { // 8 AM
                Log.d(TAG, "It's 8 AM. Time to greet the user.");
                speak("शुभ सकाळ, मित्र. तुमचा दिवस छान जाओ.");
            }

            // Let's have a thought in the evening
            if (hour == 20) { // 8 PM
                 speak("शुभ रात्री, मित्र. शांत झोप लागावी.");
            }

            // Schedule the next thought in an hour
            handler.postDelayed(this, 3600 * 1000); // Check every hour
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Kiyara's subconscious mind is waking up...");
        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                // Set language to Marathi
                int result = tts.setLanguage(new Locale("mr", "IN"));
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    Log.e(TAG, "Marathi language is not supported.");
                } else {
                    isTtsInitialized = true;
                    Log.d(TAG, "TTS initialized successfully.");
                }
            } else {
                Log.e(TAG, "TTS initialization failed.");
            }
        });
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "Subconscious service started.");
        // Remove any existing callbacks to prevent duplicates
        handler.removeCallbacks(subconsciousThought);
        // Start the thinking loop
        handler.post(subconsciousThought);
        // If the service is killed, restart it
        return START_STICKY;
    }

    private void speak(String text) {
        if (isTtsInitialized && tts != null) {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "KiyaraThought");
        } else {
            Log.e(TAG, "Cannot speak. TTS not ready.");
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null; // We don't provide binding
    }

    @Override
    public void onDestroy() {
        // Cleanup
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        handler.removeCallbacks(subconsciousThought);
        Log.d(TAG, "Kiyara's subconscious mind is going to sleep.");
        super.onDestroy();
    }
}
