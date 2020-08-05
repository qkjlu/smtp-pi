package com.smtp.smtp;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class Helper {
    public static String getDayString(){
        Date date = new Date();
        DateFormat formatter = new SimpleDateFormat("EEEE", Locale.FRANCE);
        return formatter.format(date);
    }
}
