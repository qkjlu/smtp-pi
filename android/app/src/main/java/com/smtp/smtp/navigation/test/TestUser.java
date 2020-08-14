package com.smtp.smtp.navigation.test;

import com.smtp.smtp.navigation.User;

import org.junit.Assert;
import org.junit.Test;

public class TestUser {
    @Test
    public void userWithSameIdAreEquals(){
        User u1 = new User("1", 1.0, "chargé");
        User u2 = new User("1", 2.0, "déchargé");
        Assert.assertTrue(u1.equals(u2));
    }

    @Test
    public void userWithDifferentIdAreNotEquals(){
        User u1 = new User("1", 1.0, "chargé");
        User u2 = new User("2", 2.0, "déchargé");
        Assert.assertFalse(u1.equals(u2));
    }
}
