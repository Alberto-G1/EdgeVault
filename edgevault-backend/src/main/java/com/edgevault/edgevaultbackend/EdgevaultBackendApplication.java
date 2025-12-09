package com.edgevault.edgevaultbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EdgevaultBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EdgevaultBackendApplication.class, args);
    }

}