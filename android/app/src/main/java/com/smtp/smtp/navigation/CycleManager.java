package com.smtp.smtp.navigation;

public class CycleManager extends Thread {
    private final String TAG = "CycleManager";
    Runnable callback;
    Cycle cycle;
    Cycle previousCycle;
    boolean newRouteHasBeenFetched;
    public CycleManager(Runnable callback, Cycle cycle){
        super("CycleManager");
        this.callback = callback;
        this.cycle = cycle;
        newRouteHasBeenFetched = false;
        try {
            this.previousCycle = cycle.cloneMe();
        } catch (Exception e) {
            throw new RuntimeException("Cannot clone cycle");
        }

    }

    private boolean newCycleIsDifferentThanPrevious() {
        return !previousCycle.equals(cycle);
    }

    public boolean newRouteHasBeenFetched() {
        return newRouteHasBeenFetched;
    }

    @Override
    public void run() {
        while(true){
            try {
                if(newCycleIsDifferentThanPrevious()){
                    newRouteHasBeenFetched = true;
                    this.callback.run();
                    previousCycle = cycle.cloneMe();
                }
                Thread.sleep(5000);
                newRouteHasBeenFetched = false;
            } catch (InterruptedException | CloneNotSupportedException e) {
                e.printStackTrace();
            }
        }
    }
}
