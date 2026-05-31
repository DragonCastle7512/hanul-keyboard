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
import android.graphics.Region
import android.view.ViewGroup
import android.os.Handler
import android.os.Looper
import android.content.Intent
import android.provider.Settings
import android.content.ComponentName
import android.content.Context
import android.view.inputmethod.InputMethodManager
import com.facebook.react.bridge.Promise

class HanulIME : InputMethodService() {
    companion object {
        var currentInstance: HanulIME? = null
    }

    private var mContainer: FrameLayout? = null
    private var mReactRootView: ReactRootView? = null
    private var mReactInstanceManager: ReactInstanceManager? = null
    private var mIsInternalSelectionUpdate = false

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

    private fun getTotalKeyboardHeightPx(): Int {
        val scale = resources.displayMetrics.density
        val keyboardHeightPx = (320 * scale + 0.5f).toInt()
        val navigationBarHeightPx = getNavigationBarHeightPx()
        return keyboardHeightPx + navigationBarHeightPx
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
        val totalKeyboardHeightPx = getTotalKeyboardHeightPx()
        mContainer = FrameLayout(this)
        mContainer?.setBackgroundColor(Color.TRANSPARENT)

        mContainer?.layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            totalKeyboardHeightPx
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
                totalKeyboardHeightPx
            ))
        } catch (e: Exception) {
        }

        return mContainer!!
    }

    override fun onComputeInsets(outInsets: Insets) {
        super.onComputeInsets(outInsets)
        val inputView = mContainer ?: return

        val totalHeight = inputView.height
        val totalWidth = inputView.width
        if (totalHeight <= 0) return

        val totalKeyboardHeightPx = getTotalKeyboardHeightPx()
        val top = (totalHeight - totalKeyboardHeightPx).coerceAtLeast(0)

        outInsets.contentTopInsets = top
        outInsets.visibleTopInsets = top

        outInsets.touchableRegion.set(0, top, totalWidth, totalHeight)
        outInsets.touchableInsets = Insets.TOUCHABLE_INSETS_REGION
    }

    override fun onStartInput(info: EditorInfo?, restarting: Boolean) {
        super.onStartInput(info, restarting)
        // 새로운 입력 세션이 시작될 때(전송 후, 입력창 이동 등) 무조건 JS 상태 리셋 신호 발송
        try {
            val reactContext = mReactInstanceManager?.currentReactContext
            if (reactContext != null) {
                reactContext
                    .getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onResetState", null)
            }
        } catch (e: Exception) {
        }
    }

    override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
        super.onStartInputView(info, restarting)
        mReactInstanceManager?.onHostResume(null)
        try {
            val root = mReactRootView
            val container = mContainer
            val totalKeyboardHeightPx = getTotalKeyboardHeightPx()
            if (root != null && container != null) {
                (root.parent as? ViewGroup)?.removeView(root)
                container.addView(root, FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    totalKeyboardHeightPx
                ))
                container.post {
                    container.requestLayout()
                    container.invalidate()
                    root.requestLayout()
                    root.invalidate()
                }
            }
        } catch (e: Exception) {
        }
    }

    override fun onUpdateSelection(
        oldSelStart: Int, oldSelEnd: Int,
        newSelStart: Int, newSelEnd: Int,
        candidatesStart: Int, candidatesEnd: Int
    ) {
        super.onUpdateSelection(oldSelStart, oldSelEnd, newSelStart, newSelEnd, candidatesStart, candidatesEnd)

        if (mIsInternalSelectionUpdate) {
            // Even if internal, if the selection moved to 0,0, it might be a clear event
            if (newSelStart != 0 || newSelEnd != 0) {
                return
            }
        }

        // Notify React Native about selection change
        try {
            val reactContext = mReactInstanceManager?.currentReactContext
            if (reactContext != null) {
                reactContext
                    .getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onSelectionChange", null)
            }
        } catch (e: Exception) {
        }
    }

    override fun onFinishInput() {
        super.onFinishInput()
        try {
            val reactContext = mReactInstanceManager?.currentReactContext
            if (reactContext != null) {
                reactContext
                    .getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onFinishComposing", null)
            }
        } catch (e: Exception) {
        }
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
        mIsInternalSelectionUpdate = true
        ic?.setComposingText(text, 1)
        // Keep the flag true for a short time to catch asynchronous onUpdateSelection
        Handler(Looper.getMainLooper()).postDelayed({
            mIsInternalSelectionUpdate = false
        }, 50)
    }

    fun finishComposingText() {
        val ic = currentInputConnection
        ic?.finishComposingText()
    }

    fun deleteText() {
        sendKey(android.view.KeyEvent.KEYCODE_DEL)
    }

    fun sendKey(keyCode: Int) {
        val ic = currentInputConnection
        ic?.sendKeyEvent(android.view.KeyEvent(android.view.KeyEvent.ACTION_DOWN, keyCode))
        ic?.sendKeyEvent(android.view.KeyEvent(android.view.KeyEvent.ACTION_UP, keyCode))
    }

    fun moveSelection(offset: Int) {
        val ic = currentInputConnection ?: return
        val extracted = ic.getExtractedText(android.view.inputmethod.ExtractedTextRequest(), 0) ?: return
        val selectionStart = extracted.selectionStart
        val selectionEnd = extracted.selectionEnd

        // Only move if it's a cursor (not a selection range)
        if (selectionStart == selectionEnd) {
            val newPos = (selectionStart + offset).coerceIn(0, extracted.text.length)
            ic.setSelection(newPos, newPos)
        } else {
            // If there's a selection, move to the beginning/end of the selection
            if (offset < 0) {
                ic.setSelection(selectionStart, selectionStart)
            } else {
                ic.setSelection(selectionEnd, selectionEnd)
            }
        }
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

    @ReactMethod
    fun moveCursorLeft() {
        HanulIME.currentInstance?.moveSelection(-1)
    }

    @ReactMethod
    fun moveCursorRight() {
        HanulIME.currentInstance?.moveSelection(1)
    }

    @ReactMethod
    fun openKeyboardSettings() {
        val context = reactApplicationContext
        val intent = Intent(Settings.ACTION_INPUT_METHOD_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    @ReactMethod
    fun isKeyboardEnabled(promise: Promise) {
        try {
            val context = reactApplicationContext
            val imm = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            val isEnabled = imm.enabledInputMethodList.any { it.packageName == context.packageName }
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.reject("ERROR", e)
        }
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
