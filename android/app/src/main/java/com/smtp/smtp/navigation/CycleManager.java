package com.smtp.smtp.navigation;

public class CycleManager extends Thread {

    Runnable callback;
    public CycleManager(Runnable callback){
        super("CycleManager");
        this.callback = callback;
    }

    @Override
    public void run() {
        while(true){
            try {
                if(true){
                    this.callback.run();
                }
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
