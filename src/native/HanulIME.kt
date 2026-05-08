package com.hanulkeyboard

import android.view.View
import android.inputmethodservice.InputMethodService
import com.facebook.react.ReactRootView
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import android.os.Bundle
import android.view.inputmethod.EditorInfo
import android.widget.FrameLayout
import android.graphics.Color
import android.view.ViewGroup
import android.os.Handler
import android.os.Looper

class HanulIME : InputMethodService() {
    companion object {
        var currentInstance: HanulIME? = null
    }

    private var mContainer: FrameLayout? = null
    private var mReactRootView: ReactRootView? = null
    private var mReactInstanceManager: ReactInstanceManager? = null

    override fun onCreate() {
        super.onCreate()
        currentInstance = this
        try {
            val app = application
            if (app is ReactApplication) {
                mReactInstanceManager = app.reactNativeHost.reactInstanceManager
            }
        } catch (e: Exception) {
        }
    }

    override fun onCreateInputView(): View {
        mContainer = FrameLayout(this)
        mContainer?.setBackgroundColor(Color.TRANSPARENT)

        val heightInDp = 300
        val scale = resources.displayMetrics.density
        val heightInPx = (heightInDp * scale + 0.5f).toInt()

        mContainer?.layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            heightInPx
        )

        try {
            if (mReactRootView == null) {
                mReactRootView = ReactRootView(this)
                val initialProps = Bundle()
                initialProps.putBoolean("isIME", true)

                // Ensure engine is ready
                mReactInstanceManager?.onHostResume(null)

                mReactRootView?.startReactApplication(
                    mReactInstanceManager,
                    "HanulKeyboard",
                    initialProps
                )
            }

            (mReactRootView?.parent as? ViewGroup)?.removeView(mReactRootView)

            mContainer?.addView(mReactRootView, FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ))
        } catch (e: Exception) {
        }

        return mContainer!!
    }

    override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
        super.onStartInputView(info, restarting)
        mReactInstanceManager?.onHostResume(null)
    }

    override fun onFinishInputView(finishingInput: Boolean) {
        super.onFinishInputView(finishingInput)
        mReactInstanceManager?.onHostPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        currentInstance = null
        mReactRootView?.unmountReactApplication()
        mReactRootView = null
        mContainer = null
    }

    fun sendText(text: String) {
        val ic = currentInputConnection
        ic?.commitText(text, 1)
    }

    fun setComposingText(text: String) {
        val ic = currentInputConnection
        ic?.setComposingText(text, 1)
    }

    fun finishComposingText() {
        val ic = currentInputConnection
        ic?.finishComposingText()
    }

    fun deleteText() {
        val ic = currentInputConnection
        ic?.deleteSurroundingText(1, 0)
    }

    fun sendKey(keyCode: Int) {
        val ic = currentInputConnection
        ic?.sendKeyEvent(android.view.KeyEvent(android.view.KeyEvent.ACTION_DOWN, keyCode))
        ic?.sendKeyEvent(android.view.KeyEvent(android.view.KeyEvent.ACTION_UP, keyCode))
    }
}

class IMEModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "IMEModule"

    @ReactMethod
    fun commitText(text: String) {
        HanulIME.currentInstance?.sendText(text)
    }

    @ReactMethod
    fun setComposingText(text: String) {
        HanulIME.currentInstance?.setComposingText(text)
    }

    @ReactMethod
    fun finishComposingText() {
        HanulIME.currentInstance?.finishComposingText()
    }

    @ReactMethod
    fun deleteBackward() {
        HanulIME.currentInstance?.deleteText()
    }

    @ReactMethod
    fun sendEnter() {
        HanulIME.currentInstance?.sendKey(android.view.KeyEvent.KEYCODE_ENTER)
    }

    @ReactMethod
    fun sendSpace() {
        HanulIME.currentInstance?.sendText(" ")
    }
}

class IMEPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(IMEModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
