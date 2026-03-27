package com.company.kyc.dto;

import lombok.Data;
import java.util.List;

@Data
public class FraudResponseDto {
    private Integer fraudScore;
    private List<String> flags;
}