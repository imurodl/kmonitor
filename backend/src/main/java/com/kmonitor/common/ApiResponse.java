package com.kmonitor.common;

import java.time.LocalDateTime;

public record ApiResponse<T>(T data, LocalDateTime timestamp, int count) {

    public static <T> ApiResponse<T> of(T data, int count) {
        return new ApiResponse<>(data, LocalDateTime.now(), count);
    }

    public static <T> ApiResponse<T> of(T data) {
        return new ApiResponse<>(data, LocalDateTime.now(), 1);
    }
}
