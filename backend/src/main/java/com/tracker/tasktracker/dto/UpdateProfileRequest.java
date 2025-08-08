package com.tracker.tasktracker.dto;

public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String location;
    private String avatar;
    
    // Constructors
    public UpdateProfileRequest() {
    }
    
    public UpdateProfileRequest(String firstName, String lastName, String phone, String location, String avatar) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.location = location;
        this.avatar = avatar;
    }
    
    // Getters and Setters
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getAvatar() {
        return avatar;
    }
    
    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
    
    // Override toString for better debugging
    @Override
    public String toString() {
        return "UpdateProfileRequest{" +
                "firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", phone='" + phone + '\'' +
                ", location='" + location + '\'' +
                ", avatar='" + avatar + '\'' +
                '}';
    }
}
