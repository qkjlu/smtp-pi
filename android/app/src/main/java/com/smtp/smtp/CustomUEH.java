package com.smtp.smtp;

import android.util.Log;

import java.util.function.Function;

public class CustomUEH implements Thread.UncaughtExceptionHandler {
    private Runnable handler;

    private static final Thread.UncaughtExceptionHandler defaultHandler = Thread.getDefaultUncaughtExceptionHandler();

    CustomUEH(Runnable handler) {
        this.handler = handler;
    }

    public void uncaughtException(Thread t, Throwable e) {
        handler.run();
        defaultHandler.uncaughtException(t, e);
    }
}
