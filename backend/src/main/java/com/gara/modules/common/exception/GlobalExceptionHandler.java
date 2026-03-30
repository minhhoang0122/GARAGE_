package com.gara.modules.common.exception;

import com.gara.modules.common.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.http.converter.HttpMessageNotWritableException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {
        private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

        @ExceptionHandler(BusinessException.class)
        public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex, WebRequest request) {
                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(ex.getStatus().value())
                                .error(ex.getStatus().getReasonPhrase())
                                .message(ex.getMessage())
                                .path(request.getDescription(false).replace("uri=", ""))
                                .build();
                return new ResponseEntity<>(errorResponse, ex.getStatus());
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex,
                        WebRequest request) {
                String errorMsg = ex.getBindingResult().getFieldErrors().stream()
                                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                                .reduce((msg1, msg2) -> msg1 + ", " + msg2)
                                .orElse("Dữ liệu đầu vào không hợp lệ");

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                                .message(errorMsg)
                                .path(request.getDescription(false).replace("uri=", ""))
                                .build();
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(AsyncRequestNotUsableException.class)
        @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
        public void handleAsyncRequestNotUsableException(AsyncRequestNotUsableException ex) {
                // Đây là lỗi bình thường khi client ngắt kết nối SSE/Stream
                log.debug("Async connection closed by client: {}", ex.getMessage());
        }

        /**
         * Xử lý lỗi khi không thể ghi dữ liệu (thường do Content-Type text/event-stream)
         */
        @ExceptionHandler(HttpMessageNotWritableException.class)
        public ResponseEntity<?> handleHttpMessageNotWritableException(HttpMessageNotWritableException ex, WebRequest request) {
                log.warn("Không thể ghi phản hồi (Có thể do SSE bị ngắt): {}", ex.getMessage());
                
                // Nếu là SSE, không trả về JSON để tránh lỗi converter lặp lại
                if (ex.getMessage() != null && ex.getMessage().contains("text/event-stream")) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .contentType(MediaType.TEXT_PLAIN)
                                        .body("Streaming error occurred");
                }

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                                .message("Lỗi định dạng dữ liệu phản hồi")
                                .path(request.getDescription(false).replace("uri=", ""))
                                .build();
                return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
                // Log chi tiết về nguyên nhân (chỉ lấy message để log sạch)
                if (ex instanceof java.io.IOException && ex.getMessage() != null && 
                    (ex.getMessage().contains("Broken pipe") || ex.getMessage().contains("connection was aborted"))) {
                        log.debug("Network connection error: {}", ex.getMessage());
                        return null; // Im lặng khi lỗi mạng
                }

                log.error("Global error caught: ", ex);

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(LocalDateTime.now())
                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                                .message("Đã xảy ra lỗi hệ thống: " + ex.getMessage()) // Friendly message but
                                                                                       // meaningful for debug
                                .path(request.getDescription(false).replace("uri=", ""))
                                .build();
                return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
}
