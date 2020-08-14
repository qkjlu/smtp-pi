package com.smtp.smtp.navigation;

import android.util.Log;

import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class Cycle implements Cloneable, Comparable {
    private ArrayList<User> users;
    private int myIndice;
    private String myUserId;
    private String myEtat;

    public Cycle(String myUserId, String myEtat) {
        this.users = new ArrayList<>();
        this.myUserId = myUserId;
        this.myEtat = myEtat;
    }

    public void clear(){
        this.users.clear();
    }

    public int addUser(User user) {
        if (sameEtat(user) && !isContainedUser(user.getUserId())) {
            users.add(user);
            Collections.sort(users, new EtaSorter());
            return 1;
        } else {
            return -1;
        }
    }

    public boolean isContainedUser(String userId) {
        boolean res = false;
        for (int i = 0; i < users.size(); i++) {
            if (users.get(i).getUserId().equals(userId)) {
                res = true;
            }
        }
        return res;
    }
    public boolean isMyUserId(String userId) {
        return userId.equals(myUserId);
    }
    public void updateMyIndice(String userId) {
        for (int i = 0; i < users.size(); i++) {
            if (isMyUserId(users.get(i).getUserId())) {
                myIndice = i;
                Log.d(Navigation.TAG, "changement indice : " + myIndice);
            }
        }
    }

    public boolean sameEtat(User user) {
        return user.getEtat().equals(myEtat);
    }

    public void updateCycle(User user) {
        if (!sameEtat(user)) {
            this.deleteUser(user.getUserId());
        } else {
            updateUserETA(user);
        }
        Collections.sort(users, new EtaSorter());
    }

    private void updateUserETA(User user) {
        int uIndex = getUsers().indexOf(user);
        if(uIndex == -1) {
            throw new UserNotInCycleException("Cannot update user ETA that is not in cycle");
        }
        getUsers().get(uIndex).setETA(user.getETA());
    }

    public User getUserAhead(){
        if(getMyIndice() == 0) {
            throw new NoUserAheadException("Cannot get user ahead when I'm first");
        }
        return users.get(getMyIndice() -1);
    }

    public int getMyIndice() {
        int res = -1;
        for (int i = 0; i < users.size(); i++) {
            if (isMyUserId(users.get(i).getUserId())) {
                res = i;
                Log.d(Navigation.TAG, "changement indice : " + myIndice);
            }
        }
        if(res == -1 ) {
            throw new RuntimeException("User not in the cycle");
        }
        return res;
    }

    public void deleteUser(String userId) {
        int res = -1;
        for (int i = 0; i < users.size(); i++) {
            if (users.get(i).getUserId().equals(userId)) {
                res = i;
            }
        }
        users.remove(res);
        Collections.sort(users, new EtaSorter());
    }

    @Override
    protected Cycle clone() throws CloneNotSupportedException {
        Cycle clone = new Cycle(myUserId, myEtat);
        clone.setUsers(new ArrayList<>(getUsers()));
        return clone;
    }

    public Cycle cloneMe() throws CloneNotSupportedException {
        return clone();
    }

    public void setUsers(ArrayList<User> users) {
        this.users = users;
    }

    public List<User> getUsers() {
        return this.users;
    }

    public void setMyEtat(String etat) {
        this.myEtat = etat;
    }

    public String getMyEtat() {
        return this.myEtat;
    }

    public boolean someOneIsAheadMe(){
        return getMyIndice() > 0;
    }

    @Override
    public int compareTo(Object o) {
        Cycle c = (Cycle)o;
        if(c.getUsers().containsAll(getUsers())
                && c.getUsers().size() == getUsers().size()) {
            return 0;
        }
        return -1;
    }

    @Override
    public boolean equals(@Nullable Object obj) {
        return compareTo(obj) == 0;
    }

    class EtaSorter implements Comparator<User> {
        @Override
        public int compare(User o1, User o2) {
            return (int) (o1.getETA() - o2.getETA());
        }
    }

    private class UserNotInCycleException extends RuntimeException {
        public UserNotInCycleException(String msg) {
            super(msg);
        }
    }

    private class NoUserAheadException extends RuntimeException {
        public NoUserAheadException(String msg) {
            super(msg);
        }
    };


}
