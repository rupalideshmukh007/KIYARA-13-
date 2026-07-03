
package com.rupalideshmukh007.kiyara

import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class FloatingWindowModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "FloatingWindow"

    @ReactMethod
    fun createFloatingWindow() {
        val context = reactApplicationContext
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION
            )
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
        } else {
            val intent = Intent(context, FloatingWindowService::class.java)
            context.startService(intent)
        }
    }

    @ReactMethod
    fun closeFloatingWindow() {
        val context = reactApplicationContext
        context.stopService(Intent(context, FloatingWindowService::class.java))
    }
}
