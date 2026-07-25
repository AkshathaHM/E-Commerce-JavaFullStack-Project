package com.kodnest.app.utils;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SequentialIdGeneratorTest {

    @Test
    void returnsNextSequentialNumberWhenNoCollisionExists() {
        SequentialIdGenerator generator = new SequentialIdGenerator();

        String nextOrderId = generator.nextOrderId(4, id -> false);

        assertEquals("5", nextOrderId);
    }

    @Test
    void skipsExistingNumbersUntilAFreeValueIsFound() {
        SequentialIdGenerator generator = new SequentialIdGenerator();

        String nextOrderId = generator.nextOrderId(2, id -> "3".equals(id));

        assertEquals("4", nextOrderId);
    }
}
