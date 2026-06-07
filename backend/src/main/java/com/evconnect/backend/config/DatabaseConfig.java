package com.evconnect.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username:}")
    private String dbUsername;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    @Bean
    public DataSource dataSource() throws URISyntaxException {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        
        String url = dbUrl;
        String username = dbUsername;
        String password = dbPassword;
        
        // If URL starts with postgresql:// (without jdbc:), parse it
        if (url.startsWith("postgresql://")) {
            URI uri = new URI(url.replace("postgresql://", "https://"));
            
            // Extract username and password from user info
            String userInfo = uri.getUserInfo();
            if (userInfo != null && userInfo.contains(":")) {
                String[] parts = userInfo.split(":", 2);
                username = parts[0];
                password = parts[1];
            }
            
            // Build the correct JDBC URL
            String path = uri.getPath();
            String databaseName = path.startsWith("/") ? path.substring(1) : path;
            
            // Default port for PostgreSQL is 5432 if not specified
            int port = uri.getPort() != -1 ? uri.getPort() : 5432;
            
            url = "jdbc:postgresql://" + uri.getHost() + ":" + port + "/" + databaseName;
            
            // Add query parameters (like sslmode)
            String query = uri.getQuery();
            if (query != null && !query.isEmpty()) {
                url += "?" + query;
            }
        } else if (!url.startsWith("jdbc:")) {
            // If it's missing jdbc: prefix, add it
            url = "jdbc:" + url;
        }
        
        dataSource.setUrl(url);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        dataSource.setDriverClassName(driverClassName);
        
        return dataSource;
    }
}
