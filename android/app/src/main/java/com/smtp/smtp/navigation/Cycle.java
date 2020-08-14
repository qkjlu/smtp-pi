package com.smtp.smtp.navigation;

import android.util.Log;

import java.util.ArrayList;
import java.util.Collections;

public class Cycle {
    private final Navigation navigation;
    public ArrayList<User> list;

    public Cycle(Navigation navigation) {
        this.navigation = navigation;
        this.list = new ArrayList<>();
    }

    public boolean isAddable(User user) {
        return user.getEtat().equals(navigation.myEtat);
    }

    public int addList(User user) {
        if (isAddable(user) && !isContainedUser(user.getUserId())) {
            list.add(user);
            Collections.sort(list, new Navigation.EtaSorter());
            return 1;
        } else {
            return -1;
        }
    }

    public boolean isContainedUser(String userId) {
        boolean res = false;
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).getUserId().equals(userId)) {
                res = true;
            }
        }
        return res;
    }

    public void updateMyIndice(String userId) {
        for (int i = 0; i < list.size(); i++) {
            if (navigation.isMyUserId(list.get(i).getUserId())) {
                navigation.myIndice = i;
                Log.d(Navigation.TAG, "changement indice : " + navigation.myIndice);
            }
        }
    }

    public boolean sameEtat(User user) {
        return user.getEtat().equals(navigation.myEtat);
    }

    public void updateList(User user) {
        if (!sameEtat(user)) {
            this.deleteUser(user.getUserId());
        } else {
            for (int i = 0; i < list.size(); i++) {
                if (list.get(i).getUserId().equals(user.getUserId())) {
                    list.get(i).ETA = user.getETA();
                }
            }
        }
        Collections.sort(list, new Navigation.EtaSorter());
    }

    public void deleteUser(String userId) {
        int res = -1;
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).getUserId().equals(userId)) {
                res = i;
            }
        }
        list.remove(res);
        Collections.sort(list, new Navigation.EtaSorter());
    }
}
