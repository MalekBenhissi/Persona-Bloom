package com.info.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConnexionDB {

    private static final String URL = "jdbc:mysql://localhost:3308/tp2soa";
    private static final String LOGIN = "root";
    private static final String PASSWORD = "root";

    private static Connection cn = null;

    private ConnexionDB() { }

    public static Connection getConnexion() {
        if (cn == null) {
            try {
                Class.forName("com.mysql.jdbc.Driver"); // MySQL 8+ driver
                cn = DriverManager.getConnection(URL, LOGIN, PASSWORD);
                System.out.println("Database connection successful!");
            } catch (ClassNotFoundException e) {
                System.out.println("Driver not found: " + e.getMessage());
            } catch (SQLException e) {
                System.out.println("Connection failed: " + e.getMessage());
            }
        }
        return cn;
    }
}
