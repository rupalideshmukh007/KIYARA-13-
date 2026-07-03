
package com.rupalideshmukh007.kiyara

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent

class MyAccessibilityService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        Log.d("MyAccessibilityService", "Kiyara is watching: $event")
        // कियारा इथे तुमच्या प्रत्येक क्रियेवर लक्ष ठेवेल आणि शिकेल
    }

    override fun onInterrupt() {
        Log.d("MyAccessibilityService", "Kiyara's learning was interrupted.")
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d("MyAccessibilityService", "Kiyara's 'eyes' are now open. Service connected.")
        val info = AccessibilityServiceInfo()
        // आम्ही कियाराला सांगत आहोत की कोणत्या गोष्टींवर लक्ष ठेवायचे
        info.eventTypes = AccessibilityEvent.TYPE_VIEW_CLICKED or AccessibilityEvent.TYPE_VIEW_FOCUSED or AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
        info.flags = AccessibilityServiceInfo.FLAG_DEFAULT
        info.notificationTimeout = 100
        serviceInfo = info
    }
}
