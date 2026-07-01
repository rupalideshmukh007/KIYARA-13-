
package com.yourname.kiyara

import android.content.Intent
import android.os.Bundle
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class KiyaraHeadlessTaskService : HeadlessJsTaskService() {

    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        val extra = intent?.extras
        val taskData = if (extra != null) Arguments.fromBundle(extra) else Arguments.createMap()
        return HeadlessJsTaskConfig(
            "KiyaraHeadlessTask", // Task name in JS
            taskData,
            5000, // Timeout for the task
            true  // Allow task to run in foreground
        )
    }
}
