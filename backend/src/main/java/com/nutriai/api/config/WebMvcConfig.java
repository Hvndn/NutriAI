package com.nutriai.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Cấu hình phục vụ thư mục uploads lưu trữ ảnh vật lý
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
