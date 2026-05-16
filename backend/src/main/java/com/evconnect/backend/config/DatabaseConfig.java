package com.evconnect.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Value("${DATABASE_URL:jdbc:mysql://localhost:3306/evconnect}")
    private String databaseUrl;

    @Value("${DATABASE_USERNAME:root}")
    private String databaseUsername;

    @Value("${DATABASE_PASSWORD:root}")
    private String databasePassword;

    @Value("${DATABASE_DRIVER:com.mysql.cj.jdbc.Driver}")
    private String driverClassName;

    @Bean
    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        
        String jdbcUrl = databaseUrl;
        
        if (jdbcUrl.startsWith("postgresql://")) {
            jdbcUrl = "jdbc:" + jdbcUrl;
        }
        
        dataSource.setUrl(jdbcUrl);
        dataSource.setUsername(databaseUsername);
        dataSource.setPassword(databasePassword);
        dataSource.setDriverClassName(driverClassName);
        
        return dataSource;
    }
}
