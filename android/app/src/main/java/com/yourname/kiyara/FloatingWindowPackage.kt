
package com.yourname.kiyara

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class FloatingWindowPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(FloatingWindowModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationCsontext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
