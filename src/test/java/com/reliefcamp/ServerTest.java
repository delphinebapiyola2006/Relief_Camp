package com.reliefcamp;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

public class ServerTest {

    @Test
    void startServer() throws Exception {
        ConfigurableApplicationContext context =
                SpringApplication.run(ReliefcampApplication.class);

        System.out.println("======================================");
        System.out.println(" RELIEFCAMP SERVER STARTED");
        System.out.println(" http://localhost:8080");
        System.out.println("======================================");

        Thread.currentThread().join();
    }
}