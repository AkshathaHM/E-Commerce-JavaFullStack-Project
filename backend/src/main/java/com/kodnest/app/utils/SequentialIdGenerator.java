package com.kodnest.app.utils;

import java.util.function.Predicate;

public class SequentialIdGenerator {

    public String nextOrderId(int currentMaxExistingOrderId, Predicate<String> existsById) {
        int candidate = Math.max(1, currentMaxExistingOrderId + 1);
        while (existsById.test(String.valueOf(candidate))) {
            candidate++;
        }
        return String.valueOf(candidate);
    }
}
