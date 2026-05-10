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

    private fun getNavigationBarHeightPx(): Int {
        val resourceId = resources.getIdentifier("navigation_bar_height", "dimen", "android")
        if (resourceId <= 0) return 0
        return resources.getDimensionPixelSize(resourceId)
    }

    private fun getNavigationBarHeightDp(): Double {
        val heightPx = getNavigationBarHeightPx().toDouble()
        val density = resources.displayMetrics.density.toDouble().coerceAtLeast(1.0)
        return heightPx / density
    }

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

        mContainer?.layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        )

        try {
            if (mReactRootView == null) {
                mReactRootView = ReactRootView(this)
                val initialProps = Bundle()
                initialProps.putBoolean("isIME", true)
                initialProps.putDouble("bottomInset", getNavigationBarHeightDp())

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

    override fun onComputeInsets(outInsets: Insets) {
        super.onComputeInsets(outInsets)
        val inputView = mContainer ?: return
        
        val totalHeight = inputView.height
        if (totalHeight <= 0) return

        val scale = resources.displayMetrics.density
        val keyboardHeightPx = (350 * scale + 0.5f).toInt()
        val navigationBarHeightPx = getNavigationBarHeightPx()
        val totalKeyboardHeightPx = keyboardHeightPx + navigationBarHeightPx
        
        val top = (totalHeight - totalKeyboardHeightPx).coerceAtLeast(0)

        outInsets.contentTopInsets = top
        outInsets.visibleTopInsets = top
        outInsets.touchableInsets = Insets.TOUCHABLE_INSETS_CONTENT
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
