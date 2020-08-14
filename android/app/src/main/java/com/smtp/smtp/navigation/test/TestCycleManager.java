package com.smtp.smtp.navigation.test;

import com.smtp.smtp.navigation.Cycle;
import com.smtp.smtp.navigation.CycleManager;
import com.smtp.smtp.navigation.User;

import org.junit.Assert;
import org.junit.Test;

public class TestCycleManager {
    @Test
    public void newRouteIsFetchedWhenCycleChange() {
        Cycle c = new Cycle("1", "chargé");
        User u1 = new User("1", 2.0, "chargé");
        User u2 = new User("2", 3.0, "chargé");
        c.addUser(u1);
        c.addUser(u2);
        CycleManager cycleManager = new CycleManager(() -> {}, c);
        u2.setState("déchargé");
        c.updateCycle(u2);

        cycleManager.start();
        try {
            Thread.sleep(1000);
            Assert.assertTrue(cycleManager.newRouteHasBeenFetched());
        } catch (InterruptedException e) {
            e.printStackTrace();
        }


    }
}
