package com.smtp.smtp.navigation;

import org.junit.Assert;
import org.junit.Test;


public class TestCycle {

    @Test
    public void cloneStateIsDifferentAfterModification() throws CloneNotSupportedException {
        Cycle c1 = new Cycle("1","chargé");
        Cycle c2 = c1.clone();
        c2.setMyEtat("déchargé");
        Assert.assertNotEquals(c1.getMyEtat(), c2.getMyEtat());
    }

    @Test
    public void cycleCloneListIsDifferentAfterModification() throws CloneNotSupportedException {
         Cycle c1 = new Cycle("1","chargé");
         User u1 = new User("1", 1.0, "chargé");
         User u2 = new User("2", 2.0, "chargé");
         c1.addUser(u1);
         c1.addUser(u2);
         Cycle c2 = c1.clone();
         c1.deleteUser(u1.getUserId());
         Assert.assertTrue( "Cycle clone must keep his element when it is deleted from original",
                 c2.getUsers().contains(u1) && c2.getUsers().contains(u2));
         Assert.assertNotEquals("Cycle clone size must be different than original after modification",
                c1.getUsers().size(), c2.getUsers().size());
         Assert.assertNotEquals("Cycle clone must be different than original after modification",
                 c1.getUsers(), c2.getUsers());
    }

    @Test
    public void cycleOrderIsDifferentAfterUpdateWithSmallerETA() {
        Cycle c1 = new Cycle("1","chargé");
        User u1 = new User("1", 2.0, "chargé");
        User u2 = new User("2", 3.0, "chargé");
        c1.addUser(u1);
        c1.addUser(u2);
        u2.setETA(1.0);
        c1.updateCycle(u2);
        Assert.assertEquals("User with smaller ETA should be first",
                c1.getUsers().get(0), u2 );
        Assert.assertEquals("User with bigger ETA should be second",
                c1.getUsers().get(1), u1 );
    }

    @Test
    public void userIsNotInTheCycleAfterHisStateChanged() {
        Cycle c1 = new Cycle("1","chargé");
        User u1 = new User("1", 2.0, "chargé");
        User u2 = new User("2", 3.0, "chargé");
        c1.addUser(u1);
        c1.addUser(u2);
        u2.setState("déchargé");
        c1.updateCycle(u2);

        Assert.assertEquals("", c1.getUsers().size(), 1);
    }

    @Test
    public void cycleAreNotEqualsAfterOneIsModified() throws CloneNotSupportedException {
        Cycle c1 = new Cycle("1","chargé");
        User u1 = new User("1", 2.0, "chargé");
        User u2 = new User("2", 3.0, "chargé");
        c1.addUser(u1);
        c1.addUser(u2);
        Cycle c2 = c1.clone();
        c1.deleteUser("1");

        Assert.assertTrue("Two cycle must not be equals if one is modified",
                !c1.equals(c2));
    }

    @Test
    public void cycleAreEqualsAfterClone() throws CloneNotSupportedException {
        Cycle c1 = new Cycle("1","chargé");
        User u1 = new User("1", 2.0, "chargé");
        User u2 = new User("2", 3.0, "chargé");
        c1.addUser(u1);
        c1.addUser(u2);
        Cycle c2 = c1.clone();

        Assert.assertTrue("Two cycle must be equals after clone",
                c1.equals(c2));
    }
}
