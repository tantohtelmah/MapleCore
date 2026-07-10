package com.maplecore.banking.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @NotBlank(message = "Street address is required")
    @Size(max = 100, message = "Street address must not exceed 100 characters")
    @Column(name = "street_address")
    private String streetAddress;

    @NotBlank(message = "City is required")
    @Size(max = 50, message = "City must not exceed 50 characters")
    @Column(name = "city")
    private String city;

    @NotBlank(message = "Province is required")
    @Size(max = 50, message = "Province must not exceed 50 characters")
    @Column(name = "province")
    private String province;

    @NotBlank(message = "Postal code is required")
    @Pattern(regexp = "^[A-Z]\\d[A-Z] \\d[A-Z]\\d$", message = "Postal code must be a valid Canadian postal code (e.g. K1A 0B1)")
    @Column(name = "postal_code")
    private String postalCode;

    @NotBlank(message = "Country is required")
    @Size(max = 50, message = "Country must not exceed 50 characters")
    @Column(name = "country")
    private String country;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Address address = (Address) o;
        return Objects.equals(streetAddress, address.streetAddress) &&
                Objects.equals(city, address.city) &&
                Objects.equals(province, address.province) &&
                Objects.equals(postalCode, address.postalCode) &&
                Objects.equals(country, address.country);
    }

    @Override
    public int hashCode() {
        return Objects.hash(streetAddress, city, province, postalCode, country);
    }
}
