import React, { useEffect, useMemo, useRef, useState } from "react";
import { URL } from "./environment";
const KYC_STYLES = `:root {
  --bg-a: #eef4fd;
  --bg-b: #f4f8ff;
  --surface: #ffffff;
  --surface-soft: #f7fbff;
  --text: #102238;
  --muted: #607287;
  --line: #c8d8eb;
  --primary: #0f62c8;
  --primary-2: #1f6dc8;
  --accent: #d4a843;
  --danger: #d82b4e;
  --success: #169b5d;
  --warning: #c98517;
  --shadow: 0 22px 60px rgba(15, 35, 58, 0.12);
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

body {
  margin: 0;
  font-family: "Manrope", "Segoe UI", sans-serif;
  color: var(--text);
  background: transparent;
}

.kyc-page {
  min-height: 100%;
  width: 100%;
  background: inherit;
  padding: 26px 20px 62px;
  position: relative;
  overflow-x: hidden;
}

.kyc-page::before {
  content: none;
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-orb {
  display: none;
}

.orb-1 {
  display: none;
}

.orb-2 {
  display: none;
}

.kyc-shell {
  max-width: 1120px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero {
  text-align: center;
  margin-bottom: 20px;
}

.hero h1 {
  margin: 0;
  font-size: clamp(2rem, 4.2vw, 3.15rem);
  letter-spacing: 0.01em;
  background: linear-gradient(95deg, #0f62c8 2%, #1f6dc8 58%, #d4a843 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 10px 24px rgba(15, 98, 200, 0.2);
}

.hero p {
  margin: 10px 0 0;
  color: #5f6f83;
  font-size: 1.06rem;
}

.kyc-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.97), rgba(246, 251, 255, 0.98));
  border-radius: 14px;
  box-shadow: var(--shadow);
  border: 1px solid rgba(200, 216, 235, 0.9);
  padding: 24px;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
}

.card::before {
  content: "";
  position: absolute;
  left: -60%;
  top: 0;
  width: 55%;
  height: 100%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.65), transparent);
  transform: skewX(-12deg);
}

.card:hover::before {
  animation: shimmer 1.1s ease;
}

.card::after {
  content: "";
  position: absolute;
  width: 260px;
  height: 260px;
  right: -140px;
  top: -150px;
  background: radial-gradient(circle, rgba(15, 98, 200, 0.17), transparent 68%);
  pointer-events: none;
}

.card:hover {
  transform: translateY(-4px);
  border-color: rgba(15, 98, 200, 0.32);
  box-shadow: 0 28px 62px rgba(12, 38, 63, 0.18);
}

.card h2 {
  margin: 0 0 18px;
  font-size: 1rem;
}

.step-card {
  margin-bottom: 20px;
}

.stepper {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.step-item {
  position: relative;
  text-align: center;
}

.step-item::after {
  content: "";
  position: absolute;
  left: calc(50% + 22px);
  right: -54%;
  top: 19px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #dce8f5, #d1e6ff);
}

.step-item:last-child::after {
  display: none;
}

.step-dot {
  width: 38px;
  height: 38px;
  margin: 0 auto 8px;
  border-radius: 50%;
  border: 2px solid #b6cee8;
  display: grid;
  place-items: center;
  background: #fff;
  font-size: 0.92rem;
  font-weight: 800;
  transition: all 0.35s ease;
}

.step-item p {
  margin: 0;
  font-size: 0.86rem;
  color: #6d7f92;
}

.step-item.done .step-dot,
.step-item.active .step-dot {
  border-color: var(--primary);
}

.step-item.done .step-dot {
  background: linear-gradient(130deg, var(--primary), #2f8df8);
  color: #fff;
}

.step-item.active .step-dot {
  box-shadow: 0 0 0 6px rgba(15, 98, 200, 0.16);
  transform: scale(1.06);
}

.step-item.active p,
.step-item.done p {
  color: #1a3552;
  font-weight: 700;
}

.step-item.done::after {
  background: linear-gradient(90deg, #3a8ef0, #0f62c8);
}

.method-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.method-option {
  border: 1px solid #c7dbef;
  border-radius: 14px;
  background: linear-gradient(150deg, #f8fcff, #eef7ff);
  padding: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
  cursor: pointer;
  transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}

.method-option:hover {
  transform: translateY(-2px);
  border-color: #7eaee6;
  box-shadow: 0 12px 22px rgba(17, 79, 145, 0.14);
}

.method-option.active {
  border-color: var(--primary);
  box-shadow: 0 10px 24px rgba(15, 98, 200, 0.2);
  background: linear-gradient(145deg, #f3f8ff, #ebf7ff);
}

.method-option input {
  width: 17px;
  height: 17px;
  accent-color: var(--primary);
}

.method-option span {
  font-weight: 700;
}

.card-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 18px;
}

.card-topline h2 {
  margin: 0;
}

.section-note {
  margin: 0;
  color: #60778f;
  font-size: 0.94rem;
}

.digilocker-btn {
  border: 0;
  border-radius: 999px;
  height: 42px;
  padding: 0 18px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(95deg, #0f62c8 0%, #1f6dc8 58%, #d4a843 130%);
  background-size: 140% 140%;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
  box-shadow: 0 12px 24px rgba(15, 98, 200, 0.28);
}

.digilocker-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 18px 28px rgba(15, 98, 200, 0.3);
}

.digilocker-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.digilocker-btn:disabled {
  opacity: 0.58;
  cursor: not-allowed;
}

.dl-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 23, 39, 0.54);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 999;
  animation: fadeIn 0.25s ease;
}

.dl-modal {
  width: min(560px, calc(100vw - 28px));
  border-radius: 18px;
  border: 1px solid rgba(191, 213, 236, 0.74);
  background: linear-gradient(145deg, #ffffff, #f6fbff);
  box-shadow: 0 24px 52px rgba(9, 31, 53, 0.28);
  padding: 18px;
  animation: slideUp 0.35s ease;
}

.dl-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.dl-modal-head h3 {
  margin: 0;
  font-size: 1.08rem;
}

.dl-close {
  border: 0;
  border-radius: 999px;
  background: #e8eff7;
  color: #24415e;
  padding: 8px 12px;
  font-weight: 700;
  cursor: pointer;
}

.dl-progress {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}

.dl-progress span {
  font-size: 0.75rem;
  text-align: center;
  color: #6f8195;
  border: 1px solid #cddced;
  border-radius: 999px;
  padding: 5px 6px;
  background: #f4f8fd;
}

.dl-progress span.active {
  color: #ffffff;
  background: linear-gradient(90deg, #0f62c8, #15a38f);
  border-color: transparent;
}

.dl-step-body p {
  margin: 0 0 10px;
  color: #4f667d;
}

.dl-step-body input {
  width: 100%;
  border: 1px solid #c7d9ec;
  border-radius: 12px;
  height: 46px;
  padding: 0 12px;
  font-size: 0.96rem;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.dl-step-body input:focus {
  border-color: #2f86e9;
  box-shadow: 0 0 0 4px rgba(15, 98, 200, 0.13);
}

.dl-consent-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #eff7ff;
  border: 1px solid #d2e2f5;
}

.dl-consent-note input {
  margin-top: 2px;
  accent-color: var(--primary);
}

.dl-consent-note span {
  color: #38516b;
  font-size: 0.92rem;
}

.dl-fetch-loader {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid #d0e2f7;
  border-top-color: #0f62c8;
  animation: spin 0.8s linear infinite;
}

.dl-error {
  margin: 10px 0 0;
  color: #c52749;
  font-weight: 700;
  font-size: 0.84rem;
}

.dl-actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}

.dl-primary {
  border: 0;
  border-radius: 999px;
  padding: 10px 15px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(95deg, #0f62c8, #15a38f);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 10px 18px rgba(15, 98, 200, 0.28);
}

.dl-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(15, 98, 200, 0.3);
}

.dl-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.field {
  position: relative;
  transition: transform 0.3s ease;
}

.field:hover {
  transform: translateY(-1px);
}

.field textarea,
.field input {
  width: 100%;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: linear-gradient(180deg, #ffffff, #f9fcff);
  color: var(--text);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}

.field input {
  height: 56px;
  padding: 22px 14px 8px;
  line-height: 1.2;
}

.field textarea {
  min-height: 110px;
  resize: vertical;
  padding: 26px 14px 12px;
  grid-column: span 2;
}

.field label {
  position: absolute;
  left: 14px;
  top: 18px;
  font-size: 0.93rem;
  color: #778ba0;
  pointer-events: none;
  background: transparent;
  transform-origin: left center;
  transition: transform 0.3s ease, top 0.3s ease, color 0.3s ease;
}

.field textarea:focus + label,
.field textarea:not(:placeholder-shown) + label,
.field input:focus + label,
.field input:not(:placeholder-shown) + label,
.field.has-value label {
  top: 7px;
  transform: scale(0.82);
  color: var(--primary);
}

.field input:focus,
.field textarea:focus {
  border-color: #2f86e9;
  background: #ffffff;
  box-shadow: 0 0 0 5px rgba(15, 98, 200, 0.14);
}

.field.is-error input,
.field.is-error textarea {
  border-color: var(--danger);
  box-shadow: 0 0 0 4px rgba(216, 43, 78, 0.1);
}

.field.is-valid input,
.field.is-valid textarea {
  border-color: var(--success);
}

.field-error {
  margin: 8px 0 0;
  color: var(--danger);
  font-size: 0.82rem;
  font-weight: 600;
}

.autofill-highlight {
  animation: autofillPulse 1s ease;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.upload-label {
  margin: 0 0 8px;
  font-size: 0.92rem;
  color: #597088;
}

.upload-box {
  border: 2px dashed #7ca7df;
  border-radius: 16px;
  min-height: 140px;
  background: linear-gradient(145deg, #fbfdff 0%, #f2f8ff 100%);
  cursor: pointer;
  transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
}

.upload-box:hover,
.upload-box.dragging {
  border-color: var(--primary);
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(15, 98, 200, 0.19);
  background: linear-gradient(145deg, #f6fbff 0%, #eaf5ff 100%);
}

.upload-box.uploaded {
  border-color: var(--success);
  background: linear-gradient(145deg, #f2fff8, #ebfff5);
}

.upload-content {
  text-align: center;
  animation: fadeIn 0.45s ease;
}

.upload-title {
  margin: 0;
  font-weight: 700;
}

.upload-subtitle {
  margin: 7px 0 0;
  color: var(--muted);
  font-size: 0.89rem;
}

.file-preview {
  width: 100%;
  text-align: center;
  animation: riseIn 0.4s ease;
}

.file-name {
  margin: 0;
  font-weight: 700;
  color: #1d4969;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-success {
  margin-top: 9px;
  display: inline-flex;
  padding: 6px 11px;
  border-radius: 999px;
  background: rgba(22, 155, 93, 0.16);
  color: #0d8b51;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.actions {
  text-align: center;
  border: 1px solid rgba(17, 44, 74, 0.1);
  border-radius: 20px;
  background: linear-gradient(130deg, rgba(255, 255, 255, 0.92), rgba(241, 249, 255, 0.94));
  padding: 20px 16px;
}

.status-message {
  min-height: 22px;
  margin: 0 0 12px;
  color: #0f5a7a;
  font-weight: 700;
}

.button-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.submit-btn,
.reset-btn {
  border: 0;
  border-radius: 999px;
  min-width: 198px;
  height: 52px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
}

.submit-btn {
  color: #fff;
  background: linear-gradient(98deg, #0f62c8 0%, #1f6dc8 58%, #d4a843 130%);
  background-size: 160% 160%;
  box-shadow: 0 14px 28px rgba(15, 98, 200, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: scale(1.04) translateY(-1px);
  box-shadow: 0 20px 34px rgba(15, 98, 200, 0.33);
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.reset-btn {
  color: #2d4a64;
  background: linear-gradient(145deg, #f2f7fc, #e7eef8);
}

.reset-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(30, 56, 84, 0.16);
}

.loader-wrap {
  margin-top: 16px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #cfe0f2;
  background: linear-gradient(145deg, #f7fbff, #eef6ff);
  color: #355f82;
  animation: fadeIn 0.35s ease;
}

.loader-head {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}

.loader {
  width: 22px;
  height: 22px;
  border: 3px solid #c0d8f1;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.78s linear infinite;
}

.loader-progress {
  margin-top: 10px;
}

.loader-track {
  width: 100%;
  height: 10px;
  background: #dce9f7;
  border-radius: 999px;
  overflow: hidden;
}

.loader-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0f62c8, #1f6dc8, #15a38f);
  transition: width 0.45s ease;
}

.loader-label {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #46627f;
  font-weight: 600;
}

.loader-stages {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
}

.loader-stages li {
  font-size: 0.82rem;
  color: #6a7f95;
}

.loader-stages li.active {
  color: #0f62c8;
  font-weight: 700;
}

.loader-stages li.done {
  color: #168d58;
}

.result-card {
  margin-top: 12px;
}

.result-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid #dfe8f1;
}

.result-meta p {
  margin: 0;
  font-size: 0.95rem;
}

.result-meta span {
  color: var(--muted);
  margin-right: 8px;
  font-weight: 600;
}

.risk-wrap {
  margin: 22px 0 20px;
  padding: 20px;
  background: linear-gradient(145deg, rgba(15, 98, 200, 0.04), rgba(15, 98, 200, 0.02));
  border-radius: 12px;
  border: 1px solid rgba(15, 98, 200, 0.08);
}

.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #2f4f6d;
}

.risk-header span {
  font-weight: 600;
  font-size: 0.9rem;
}

.risk-header strong {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f62c8;
}

.risk-track {
  width: 100%;
  height: 16px;
  border-radius: 999px;
  background: #e2edf8;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.risk-fill {
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #1eb266 0%, #e59d21 58%, #d84e4e 100%);
  animation: riskGrow 1.35s ease forwards;
  box-shadow: 0 2px 8px rgba(15, 98, 200, 0.25);
}

.result-status {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #dfe8f1;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  width: 100%;
}

.result-status p {
  margin: 0;
  color: #2f4f6d;
  font-weight: 700;
  font-size: 0.95rem;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: auto;
}

.result-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 23, 39, 0.58);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 16px 40px;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
  overflow-y: auto;
}

.result-modal {
  width: min(580px, calc(100vw - 32px));
  border-radius: 18px;
  border: 1px solid rgba(200, 216, 235, 0.8);
  background: linear-gradient(145deg, #ffffff, #f6fbff);
  box-shadow: 0 26px 64px rgba(9, 31, 53, 0.32);
  padding: 0;
  overflow: visible;
  animation: slideUp 0.35s ease;
  display: flex;
  flex-direction: column;
  margin: auto;
  flex-shrink: 0;
}

.result-modal-header {
  background: linear-gradient(135deg, #0f62c8 0%, #1f6dc8 100%);
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  gap: 12px;
}

.result-modal-header h2 {
  margin: 0;
  color: #fff;
  font-size: clamp(1rem, 3vw, 1.4rem);
  font-weight: 800;
}

.result-modal-close {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.result-modal-close:hover {
  background: rgba(255, 255, 255, 0.28);
  transform: translateY(-1px);
}

.result-modal-body {
  padding: clamp(16px, 4vw, 28px) clamp(16px, 5vw, 32px) 28px;
  min-width: 0;
}

.result-scores-row {
  display: flex;
  gap: 12px;
  margin: 18px 0 4px;
  flex-wrap: wrap;
}

.result-score-chip {
  flex: 1;
  min-width: 100px;
  background: #f4f7fb;
  border: 1px solid #dde2ea;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-score-chip span {
  font-size: 0.72rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.result-score-chip strong {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
}

.result-message {
  margin-top: 16px;
  padding: 12px 14px;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-left: 3px solid #b45309;
  border-radius: 8px;
  font-size: 0.88rem;
  color: #4a5568;
  line-height: 1.5;
}

.result-message span {
  font-weight: 700;
  color: #b45309;
  margin-right: 6px;
}

.status-badge {
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.approved {
  color: #0c6d40;
  background: linear-gradient(135deg, rgba(22, 155, 93, 0.15), rgba(22, 155, 93, 0.08));
  border: 1px solid rgba(22, 155, 93, 0.3);
}

.status-badge.review {
  color: #8b5600;
  background: linear-gradient(135deg, rgba(201, 133, 23, 0.2), rgba(201, 133, 23, 0.1));
  border: 1px solid rgba(201, 133, 23, 0.4);
}

.status-badge.rejected {
  color: #971832;
  background: linear-gradient(135deg, rgba(216, 43, 78, 0.18), rgba(216, 43, 78, 0.08));
  border: 1px solid rgba(216, 43, 78, 0.35);
}

.flag-list-wrap {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #dfe8f1;
}

.flag-list-wrap h3 {
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 700;
  color: #2f4f6d;
}

.flag-list {
  margin: 0;
  padding-left: 22px;
  color: #324f68;
  list-style-type: none;
}

.flag-list li {
  margin-bottom: 8px;
  font-size: 0.92rem;
  position: relative;
}

.flag-list li::before {
  content: '●';
  color: #0f62c8;
  font-size: 0.6rem;
  margin-left: -16px;
  margin-right: 10px;
  font-weight: bold;
}

.fade-in {
  animation: fadeIn 0.85s ease both;
}

.slide-up {
  animation: slideUp 0.7s ease both;
}

.delay-1 {
  animation-delay: 0.1s;
}

.delay-2 {
  animation-delay: 0.18s;
}

.slide-in-right {
  animation: slideInRight 0.6s ease both;
}

@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes floatOrb {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes shimmer {
  from {
    left: -60%;
  }
  to {
    left: 120%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(28px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes riseIn {
  from {
    transform: translateY(8px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes riskGrow {
  from {
    width: 0;
  }
}

@keyframes autofillPulse {
  0% {
    transform: translateY(0);
    filter: brightness(1);
  }
  35% {
    transform: translateY(-2px);
    filter: brightness(1.06);
  }
  100% {
    transform: translateY(0);
    filter: brightness(1);
  }
}

@media (max-width: 960px) {
  .stepper {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: 14px;
  }

  .step-item::after {
    display: none;
  }

  .method-grid {
    grid-template-columns: 1fr;
  }

  .card-topline {
    flex-direction: column;
    align-items: flex-start;
  }

  .digilocker-btn {
    width: 100%;
  }

  .upload-grid {
    grid-template-columns: 1fr;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .field textarea {
    grid-column: span 1;
  }

  .dl-progress {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .kyc-page {
    padding: 18px 12px 46px;
  }

  .result-modal-backdrop {
    padding: 20px 8px 20px;
    align-items: flex-start;
  }

  .result-modal {
    width: 100%;
    border-radius: 14px;
  }

  .result-meta {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .result-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .risk-wrap {
    padding: 14px;
  }

  .flag-list-wrap h3 {
    font-size: 0.9rem;
  }

  .card {
    padding: 18px;
    border-radius: 17px;
  }

  .hero p {
    font-size: 0.95rem;
  }

  .submit-btn,
  .reset-btn {
    width: 100%;
  }
}`;

const INITIAL_FORM = {
  fullName: "",
  dob: "",
  pan: "",
  aadhaar: "",
  mobile: "",
  address: "",
};

//const REQUIRED_FIELDS = ["fullName", "dob", "pan", "aadhaar", "mobile", "address"];
const REQUIRED_FIELDS = [];

const FIELD_LABELS = {
  fullName: "Full Name",
  dob: "Date of Birth",
  pan: "PAN Number",
  aadhaar: "Aadhaar Number",
  mobile: "Mobile Number",
  address: "Address",
};

const STEPS = ["Upload", "Processing", "Verified", "Completed"];
const PROCESSING_STAGES = [
  "Validating documents",
  "Running fraud checks",
  "Scoring risk profile",
  "Preparing final decision",
];

function mockPanOcrApi() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: "Sample User",
        pan: "ABCDE1234F",
        dob: "1998-05-10",
      });
    }, 1200);
  });
}

function mockDigiLockerApi() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: "Tanmay Nigade",
        dob: "2002-08-15",
        aadhaar: "123456789012",
        address: "Pune, Maharashtra",
      });
    }, 1400);
  });
}

function validateField(name, value) {
  const trimmed = typeof value === "string" ? value.trim() : value;

  if (REQUIRED_FIELDS.includes(name) && !trimmed) {
    return "This field is required.";
  }

  if (name === "pan" && trimmed && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(trimmed)) {
    return "PAN must be in format ABCDE1234F.";
  }

  if (name === "aadhaar" && trimmed && !/^\d{12}$/.test(trimmed)) {
    return "Aadhaar must be exactly 12 digits.";
  }

  if (name === "mobile" && trimmed && !/^\d{10}$/.test(trimmed)) {
    return "Mobile number must be exactly 10 digits.";
  }

  return "";
}

function validateForm(form) {
  return Object.keys(INITIAL_FORM).reduce((acc, key) => {
    acc[key] = validateField(key, form[key]);
    return acc;
  }, {});
}

function getRiskResult(form) {
  const flags = [];

  if (!form.address || form.address.length < 12) flags.push("Address looks incomplete");
  if (/^(\d)\1{9}$/.test(form.mobile)) flags.push("Suspicious mobile pattern");
  if (/^1234/.test(form.aadhaar)) flags.push("Aadhaar prefix flagged for manual review");

  let score = 28;
  if (flags.length >= 2) score += 23;
  if (/^([A-Z])\1{4}/.test(form.pan)) score += 16;

  score = Math.min(98, Math.max(5, score));

  let status = "APPROVED";
  if (score >= 70) status = "REJECTED";
  else if (score >= 45) status = "REVIEW";

  return {
    name: form.fullName,
    pan: form.pan,
    riskScore: score,
    status,
    fraudFlags: flags.length ? flags : ["No major fraud flags detected"],
  };
}

function normalizeKycApiResult(apiData, form) {
  const fallback = getRiskResult(form);
  const top  = apiData && typeof apiData === "object" ? apiData : {};

  // unwrap nested kycResult if present
  const kyc  = (top.kycResult && typeof top.kycResult === "object") ? top.kycResult : top;

  const caseId = top.caseId || top.case_id || top.referenceId || kyc.caseId || "N/A";

  // ── 3 dynamic fields from kycResult ──
  const rawScore   = kyc.riskScore ?? kyc.risk_score ?? kyc.score ?? fallback.riskScore;
  const riskScore  = Number.isFinite(Number(rawScore))
    ? Math.min(100, Math.max(0, Math.round(Number(rawScore))))
    : fallback.riskScore;

  const rawStatus  = String(kyc.status || kyc.kycStatus || "").trim().toUpperCase();
  const statusMap  = { REJECT: "REJECTED", APPROVE: "APPROVED" };
  const mapped     = statusMap[rawStatus] || rawStatus;
  const status     = ["APPROVED", "REJECTED", "REVIEW"].includes(mapped)
    ? mapped
    : riskScore >= 70 ? "REJECTED" : riskScore >= 45 ? "REVIEW" : "APPROVED";

  const rawSignals = kyc.fraudSignals || kyc.fraudFlags || kyc.fraud_flags || [];
  const fraudFlags = Array.isArray(rawSignals)
    ? rawSignals.map((s) => String(s).trim()).filter(Boolean)
    : typeof rawSignals === "string" && rawSignals.trim()
    ? [rawSignals.trim()]
    : [];

  // ── remaining fields (static fallbacks ok) ──
  const message       = kyc.message || top.message || "";
  const identityScore = Number.isFinite(Number(kyc.identityScore)) ? Number(kyc.identityScore) : null;
  const fraudScore    = Number.isFinite(Number(kyc.fraudScore))    ? Number(kyc.fraudScore)    : null;
  const name          = kyc.finalName || kyc.name || top.finalName || fallback.name;
  const pan           = top.pan || top.panNumber || fallback.pan;

  return { caseId, name, pan, riskScore, identityScore, fraudScore, message, status, fraudFlags };
}

function FormInput({
  name,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  touched,
  disabled,
  inputRef,
  textarea = false,
  autoFillPulse = false,
}) {
  const hasValue = String(value ?? "").trim().length > 0;
  const stateClass = !touched
    ? ""
    : error
    ? "is-error"
    : "is-valid";

  return (
    <div
      className={`field ${stateClass} ${hasValue ? "has-value" : ""} ${autoFillPulse ? "autofill-highlight" : ""}`.trim()}
      ref={inputRef}
    >
      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          rows={4}
          placeholder=" "
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder=" "
          autoComplete="off"
        />
      )}
      <label htmlFor={name}>{label}</label>
      {touched && error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

function UploadBox({
  label,
  file,
  onFileSelect,
  documentType = "pancard",
  disabled,
  loading,
  accept = ".pdf,.png,.jpg,.jpeg",
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);
  const allowedExtensions = useMemo(
    () =>
      accept
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    [accept]
  );

  const chooseFile = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const isAcceptedFile = (selectedFile) => {
    const lowerName = selectedFile.name.toLowerCase();
    return allowedExtensions.some((extension) => lowerName.endsWith(extension));
  };

  const processSelectedFile = async (selectedFile) => {
    if (!selectedFile || disabled) return;

    if (!isAcceptedFile(selectedFile)) {
      setFileError(`Invalid file type. Allowed: ${allowedExtensions.join(", ")}`);
      return;
    }

    setFileError("");
    onFileSelect(selectedFile);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      await processSelectedFile(dropped);
    }
  };

  const handleChange = async (event) => {
    const selected = event.target.files?.[0];
    await processSelectedFile(selected);

    if (event.target) {
      event.target.value = "";
    }
  };

  return (
    <div className="upload-block">
      <p className="upload-label">{label}</p>
      <div
        className={`upload-box ${isDragging ? "dragging" : ""} ${file ? "uploaded" : ""}`.trim()}
        onClick={chooseFile}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            chooseFile();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          hidden
        />
        {!file && !loading ? (
          <div className="upload-content">
            <p className="upload-title">Drag and drop your file</p>
            <p className="upload-subtitle">or click to browse</p>
          </div>
        ) : null}

        {loading ? (
          <div className="upload-content">
            <p className="upload-title">Processing PAN OCR...</p>
            <p className="upload-subtitle">Please wait</p>
          </div>
        ) : null}

        {file && !loading ? (
          <div className="file-preview">
            <p className="file-name">{file.name}</p>
            <span className="upload-success">Upload successful</span>
          </div>
        ) : null}
      </div>
      {fileError ? <p className="field-error">{fileError}</p> : null}
    </div>
  );
}

function Loader({ stageIndex }) {
  const safeStageIndex = Math.min(
    PROCESSING_STAGES.length - 1,
    Math.max(0, stageIndex || 0)
  );
  const progress = Math.round(((safeStageIndex + 1) / PROCESSING_STAGES.length) * 100);

  return (
    <div className="loader-wrap" aria-live="polite">
      <div className="loader-head">
        <div className="loader" />
        <span>Your KYC is being processed...</span>
      </div>
      <div className="loader-progress">
        <div className="loader-track">
          <div className="loader-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="loader-label">
          {PROCESSING_STAGES[safeStageIndex]} ({progress}%)
        </div>
      </div>
      <ul className="loader-stages">
        {PROCESSING_STAGES.map((stage, index) => {
          const className =
            index < safeStageIndex ? "done" : index === safeStageIndex ? "active" : "";
          return (
            <li key={stage} className={className}>
              {index < safeStageIndex ? "Done" : index === safeStageIndex ? "In progress" : "Pending"} - {stage}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RiskBar({ score }) {
  return (
    <div className="risk-wrap">
      <div className="risk-header">
        <span>Risk Score</span>
        <strong>{score}%</strong>
      </div>
      <div className="risk-track">
        <div className="risk-fill" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>;
}

function StepTracker({ currentStep }) {
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <section className="card step-card slide-up" aria-label="KYC Status Tracker">
      <h2>Status Tracker</h2>
      <div className="stepper">
        {STEPS.map((step, index) => {
          const stepClass =
            index < currentIndex
              ? "done"
              : index === currentIndex
              ? "active"
              : "pending";

          return (
            <div className={`step-item ${stepClass}`} key={step}>
              <div className="step-dot">{index + 1}</div>
              <p>{step}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DigiLockerFlowModal({ open, onClose, onComplete, loading }) {
  const [flowStep, setFlowStep] = useState("login");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (open) {
      setFlowStep("login");
      setMobile("");
      setOtp("");
      setLocalError("");
    }
  }, [open]);

  if (!open) return null;

  const handleAction = async () => {
    setLocalError("");

    if (flowStep === "login") {
      if (!/^\d{10}$/.test(mobile)) {
        setLocalError("Enter a valid 10-digit mobile number.");
        return;
      }
      setFlowStep("otp");
      return;
    }

    if (flowStep === "otp") {
      if (!/^\d{6}$/.test(otp)) {
        setLocalError("Enter the 6-digit OTP.");
        return;
      }
      setFlowStep("consent");
      return;
    }

    if (flowStep === "consent") {
      setFlowStep("fetching");
      const ok = await onComplete();
      if (ok) {
        onClose();
      } else {
        setFlowStep("consent");
      }
    }
  };

  return (
    <div className="dl-modal-backdrop" role="dialog" aria-modal="true" aria-label="DigiLocker flow">
      <div className="dl-modal">
        <div className="dl-modal-head">
          <h3>DigiLocker Verification Flow</h3>
          <button type="button" className="dl-close" onClick={onClose} disabled={loading}>
            Close
          </button>
        </div>

        <div className="dl-progress">
          <span className={flowStep === "login" ? "active" : ""}>1. Login</span>
          <span className={flowStep === "otp" ? "active" : ""}>2. OTP</span>
          <span className={flowStep === "consent" ? "active" : ""}>3. Consent</span>
          <span className={flowStep === "fetching" ? "active" : ""}>4. Fetch</span>
        </div>

        {flowStep === "login" ? (
          <div className="dl-step-body">
            <p>Sign in with mobile number linked to DigiLocker.</p>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Enter 10-digit mobile"
            />
          </div>
        ) : null}

        {flowStep === "otp" ? (
          <div className="dl-step-body">
            <p>Enter OTP sent to {mobile}.</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit OTP"
            />
          </div>
        ) : null}

        {flowStep === "consent" ? (
          <div className="dl-step-body">
            <p>Allow Project KYC AI to access your KYC documents from DigiLocker.</p>
            <label className="dl-consent-note">
              <input type="checkbox" checked readOnly />
              <span>I authorize secure document fetch for KYC verification.</span>
            </label>
          </div>
        ) : null}

        {flowStep === "fetching" ? (
          <div className="dl-step-body">
            <p>Fetching data from DigiLocker...</p>
            <div className="dl-fetch-loader" />
          </div>
        ) : null}

        {localError ? <p className="dl-error">{localError}</p> : null}

        <div className="dl-actions">
          <button
            type="button"
            className="dl-primary"
            onClick={handleAction}
            disabled={loading || flowStep === "fetching"}
          >
            {flowStep === "login" ? "Send OTP" : null}
            {flowStep === "otp" ? "Verify OTP" : null}
            {flowStep === "consent" ? "Fetch from DigiLocker" : null}
            {flowStep === "fetching" ? "Fetching..." : null}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultModal({ open, onClose, result }) {
  if (!open || !result) return null;

  const statusColor = result.status === 'REJECTED' ? '#c0392b' : result.status === 'REVIEW' ? '#b45309' : '#1a6b3c';

  return (
    <div className="result-modal-backdrop" onClick={onClose}>
      <div className="result-modal" onClick={(e) => e.stopPropagation()}>

        <div className="result-modal-header">
          <h2>KYC Verification Result</h2>
          <button className="result-modal-close" onClick={onClose}>Close</button>
        </div>

        <div className="result-modal-body">

          {/* Score chips */}
          {result.caseId && result.caseId !== 'N/A' && (
            <div className="result-meta" style={{ marginBottom: '12px', justifyContent: 'center', textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: '1rem' }}><span>Case ID:</span> {result.caseId}</p>
            </div>
          )}

          {/* Score chips */}
          <div className="result-scores-row">
            {result.identityScore != null && (
              <div className="result-score-chip">
                <span>Identity Score</span>
                <strong style={{ color: result.identityScore >= 60 ? '#1a6b3c' : '#b45309' }}>
                  {result.identityScore}%
                </strong>
              </div>
            )}
            {result.fraudScore != null && (
              <div className="result-score-chip">
                <span>Fraud Score</span>
                <strong style={{ color: result.fraudScore >= 50 ? '#c0392b' : '#1a6b3c' }}>
                  {result.fraudScore}%
                </strong>
              </div>
            )}
          </div>

          {/* Risk bar */}
          <RiskBar score={result.riskScore} />

          {/* Status */}
          <div className="result-status">
            <p>Verification Status:</p>
            <StatusBadge status={result.status} />
          </div>

          {/* Remarks */}
          {result.message && (
            <div className="result-message">
              <span>Remarks:</span> {result.message}
            </div>
          )}

          {/* Fraud signals */}
          <div className="flag-list-wrap">
            <h3>Fraud Signals</h3>
            {result.fraudFlags && result.fraudFlags.length > 0 ? (
              <ul className="flag-list">
                {result.fraudFlags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#1a6b3c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                ✓ No fraud signals detected. Document appears clean.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function KycVerification() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [kycMethod, setKycMethod] = useState("upload");
  const [uploads, setUploads] = useState({
    panFile: null,
    aadhaarFile: null,
    bankStatementFile: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [digilockerLoading, setDigilockerLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [autoFillFields, setAutoFillFields] = useState([]);
  const [currentStep, setCurrentStep] = useState("Upload");
  const [isDigiLockerModalOpen, setIsDigiLockerModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [processingStageIndex, setProcessingStageIndex] = useState(0);

  const fieldRefs = useRef({});

  useEffect(() => {
    if (!submitting) {
      setProcessingStageIndex(0);
      return;
    }

    setProcessingStageIndex(0);
    const timer = setInterval(() => {
      setProcessingStageIndex((prev) =>
        prev < PROCESSING_STAGES.length - 1 ? prev + 1 : prev
      );
    }, 1200);

    return () => clearInterval(timer);
  }, [submitting]);

  const isFormValid = useMemo(() => {
    const allErrors = validateForm(form);
    const hasErrors = Object.values(allErrors).some(Boolean);
    const hasAllUploads =
      uploads.panFile && uploads.aadhaarFile && uploads.bankStatementFile;
    const uploadCondition = kycMethod === "upload" ? hasAllUploads : true;
    return !hasErrors && uploadCondition;
  }, [form, uploads, kycMethod]);

  const setFieldRef = (name) => (element) => {
    fieldRefs.current[name] = element;
  };

  const updateField = (name, value) => {
    const normalized =
      name === "pan"
        ? value.toUpperCase().replace(/[^A-Z0-9]/g, "")
        : name === "aadhaar" || name === "mobile"
        ? value.replace(/\D/g, "")
        : value;

    setForm((prev) => ({ ...prev, [name]: normalized }));

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, normalized),
      }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, form[name]) }));
  };

  const completeDigiLockerFetch = async () => {
    setDigilockerLoading(true);
    setCurrentStep("Processing");
    setSuccessMessage("");

    try {
      const data = await mockDigiLockerApi();
      const mappedData = {
        fullName: data.name,
        dob: data.dob,
        aadhaar: data.aadhaar,
        address: data.address,
      };
      const keys = Object.keys(mappedData);

      setForm((prev) => ({ ...prev, ...mappedData }));
      setTouched((prev) =>
        keys.reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, { ...prev })
      );
      setErrors((prev) =>
        keys.reduce((acc, key) => {
          acc[key] = validateField(key, mappedData[key]);
          return acc;
        }, { ...prev })
      );
      setAutoFillFields(keys);
      setTimeout(() => setAutoFillFields([]), 1200);
      setSuccessMessage("DigiLocker data fetched and fields auto-filled.");
      setCurrentStep("Verified");
      return true;
    } catch {
      setSuccessMessage("Unable to fetch DigiLocker data right now.");
      setCurrentStep("Upload");
      return false;
    } finally {
      setDigilockerLoading(false);
    }
  };

  const triggerPanOcr = async () => {
    setOcrLoading(true);
    setCurrentStep("Processing");
    setSuccessMessage("");

    try {
      const data = await mockPanOcrApi();
      setForm((prev) => ({
        ...prev,
        fullName: data.name,
        pan: data.pan,
        dob: data.dob,
      }));

      setTouched((prev) => ({
        ...prev,
        fullName: true,
        pan: true,
        dob: true,
      }));

      setErrors((prev) => ({
        ...prev,
        fullName: validateField("fullName", data.name),
        pan: validateField("pan", data.pan),
        dob: validateField("dob", data.dob),
      }));

      setAutoFillFields(["fullName", "pan", "dob"]);
      setTimeout(() => setAutoFillFields([]), 1100);
      setSuccessMessage("PAN OCR completed. Fields auto-filled.");
      setCurrentStep("Verified");
    } catch {
      setSuccessMessage("Unable to auto-fill PAN details right now.");
      setCurrentStep("Upload");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleUpload = async (key, file) => {
    if (!file) return;

    // ── File type & size validation ──
    const isImage = /\.(jpg|jpeg|png)$/i.test(file.name);
    const isPdf   = /\.pdf$/i.test(file.name);
    const IMAGE_MAX = 2 * 1024 * 1024;   // 2 MB
    const PDF_MAX   = 15 * 1024 * 1024;  // 15 MB

    if (!isImage && !isPdf) {
      setSuccessMessage("Only JPG, JPEG, PNG, or PDF files are allowed.");
      return;
    }
    if (isImage && file.size > IMAGE_MAX) {
      setSuccessMessage("Image files must be 2 MB or smaller.");
      return;
    }
    if (isPdf && file.size > PDF_MAX) {
      setSuccessMessage("PDF files must be 15 MB or smaller.");
      return;
    }

    setUploads((prev) => ({ ...prev, [key]: file }));
    setResult(null);
    if (currentStep === "Completed") {
      setCurrentStep("Upload");
    }

    if (key === "panFile") {
      await triggerPanOcr();
    }
  };

  const scrollToFirstError = (latestErrors) => {
    const firstErrorField = Object.keys(INITIAL_FORM).find((key) => latestErrors[key]);

    if (firstErrorField && fieldRefs.current[firstErrorField]) {
      fieldRefs.current[firstErrorField].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   setSuccessMessage("");

  //   const latestErrors = validateForm(form);
  //   const touchedState = Object.keys(INITIAL_FORM).reduce((acc, key) => {
  //     acc[key] = true;
  //     return acc;
  //   }, {});

  //   setTouched(touchedState);
  //   setErrors(latestErrors);

  //   const hasErrors = Object.values(latestErrors).some(Boolean);
  //   const hasAllUploads =
  //     uploads.panFile && uploads.aadhaarFile && uploads.bankStatementFile;
  //   const uploadsRequired = kycMethod === "upload";

  //   if (hasErrors || (uploadsRequired && !hasAllUploads)) {
  //     scrollToFirstError(latestErrors);
  //     if (uploadsRequired && !hasAllUploads) {
  //       setSuccessMessage("Please upload PAN, Aadhaar, and Bank Statement.");
  //     }
  //     return;
  //   }

  //   setSubmitting(true);
  //   setCurrentStep("Processing");
  //   setResult(null);

  //   try {
  //     await new Promise((resolve) => setTimeout(resolve, 1900));
  //     const summary = getRiskResult(form);
  //     setResult(summary);
  //     setIsResultModalOpen(true);
  //     setSuccessMessage("KYC submitted successfully.");
  //     setCurrentStep("Completed");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleSubmit = async (event) => {
  event.preventDefault();
  setSuccessMessage("");

  const latestErrors = validateForm(form);
  const touchedState = Object.keys(INITIAL_FORM).reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {});

  setTouched(touchedState);
  setErrors(latestErrors);

  const hasErrors = Object.values(latestErrors).some(Boolean);
  const hasAllUploads =
    uploads.panFile && uploads.aadhaarFile && uploads.bankStatementFile;

  if (hasErrors || !hasAllUploads) {
    scrollToFirstError(latestErrors);
    setSuccessMessage("Please upload PAN, Aadhaar, and Bank Statement.");
    return;
  }

  setSubmitting(true);
  setCurrentStep("Processing");

  try {
    // Read auth token from localStorage
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setSuccessMessage('Authorization token not found. Please register or login first.');
      setCurrentStep('Upload');
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("pan", uploads.panFile);
    formData.append("aadhaar", uploads.aadhaarFile);
    formData.append("bank", uploads.bankStatementFile);

    // Step 1: submit documents with Bearer token
    const processRes = await fetch(URL + "api/kyc/process", {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
      body: formData,
    });

    if (!processRes.ok) {
      const err = await processRes.text();
      console.error("Process API failed:", err);
      if (processRes.status === 401 || processRes.status === 403) {
        setSuccessMessage("Session expired or unauthorized. Please login again.");
        localStorage.removeItem('authToken');
      } else {
        setSuccessMessage("Upload failed. Please try again.");
      }
      return;
    }

    const processData = await processRes.json();
    console.log("Process API response:", processData);

    const caseId = processData.caseId || processData.case_id || processData.referenceId;

    let resultData = processData;

    // Step 2: fetch full result using caseId if available
    if (caseId) {
      const resultRes = await fetch(`${URL}api/kyc/kyc-result/${caseId}`, {
        method: "GET",
      });
      if (resultRes.ok) {
        resultData = await resultRes.json();
        console.log("Result API response:", resultData);
      } else {
        console.warn("Result fetch failed, using process response as fallback.");
      }
    }

    const summary = normalizeKycApiResult({ ...resultData, caseId: caseId || resultData.caseId }, form);
    setResult(summary);
    setIsResultModalOpen(true);
    setSuccessMessage(`KYC submitted successfully (${summary.status}).`);
    setCurrentStep("Completed");

  } catch (error) {
    console.error("API error:", error);
    setSuccessMessage("Something went wrong. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  const resetAll = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setTouched({});
    setKycMethod("upload");
    setUploads({ panFile: null, aadhaarFile: null, bankStatementFile: null });
    setSubmitting(false);
    setResult(null);
    setSuccessMessage("");
    setAutoFillFields([]);
    setCurrentStep("Upload");
    setIsDigiLockerModalOpen(false);
    setIsResultModalOpen(false);
  };

  const isDisabled = submitting || ocrLoading || digilockerLoading;

  return (
    <>
      <style>{KYC_STYLES}</style>
      <main className="kyc-page">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />

      <div className="kyc-shell">
        <header className="hero fade-in">
          <h1>KYC Verification</h1>
          <p>Verify your identity securely</p>
        </header>

        <StepTracker currentStep={currentStep} />

        <form className="kyc-form" onSubmit={handleSubmit}>
          
          <section className="card slide-up">
            <h2>Personal Details</h2>
            <div className="field-grid">
              <FormInput
                name="fullName"
                label={FIELD_LABELS.fullName}
                value={form.fullName}
                maxLength={10}
                onChange={(e) => updateField("fullName", e.target.value)}
                onBlur={() => handleBlur("fullName")}
                error={errors.fullName}
                touched={touched.fullName}
                disabled={isDisabled}
                inputRef={setFieldRef("fullName")}
                autoFillPulse={autoFillFields.includes("fullName")}
              />

              <FormInput
                name="dob"
                label={FIELD_LABELS.dob}
                type="date"
                value={form.dob}
                onChange={(e) => updateField("dob", e.target.value)}
                onBlur={() => handleBlur("dob")}
                error={errors.dob}
                touched={touched.dob}
                disabled={isDisabled}
                inputRef={setFieldRef("dob")}
                autoFillPulse={autoFillFields.includes("dob")}
              />

              <FormInput
                name="mobile"
                label={FIELD_LABELS.mobile}
                value={form.mobile}
                onChange={(e) => updateField("mobile", e.target.value.slice(0, 10))}
                onBlur={() => handleBlur("mobile")}
                error={errors.mobile}
                touched={touched.mobile}
                disabled={isDisabled}
                inputRef={setFieldRef("mobile")}
              />

              <FormInput
                name="address"
                label={FIELD_LABELS.address}
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                onBlur={() => handleBlur("address")}
                error={errors.address}
                touched={touched.address}
                disabled={isDisabled}
                inputRef={setFieldRef("address")}
                textarea
              />
            </div>
          </section>
          <section className="card slide-up">
            <h2>Identity Details</h2>
            <div className="field-grid">
              <FormInput
                name="pan"
                label={FIELD_LABELS.pan}
                value={form.pan}
                onChange={(e) => updateField("pan", e.target.value)}
                onBlur={() => handleBlur("pan")}
                error={errors.pan}
                touched={touched.pan}
                disabled={isDisabled}
                inputRef={setFieldRef("pan")}
                autoFillPulse={autoFillFields.includes("pan")}
              />

              <FormInput
                name="aadhaar"
                label={FIELD_LABELS.aadhaar}
                value={form.aadhaar}
                onChange={(e) => updateField("aadhaar", e.target.value.slice(0, 12))}
                onBlur={() => handleBlur("aadhaar")}
                error={errors.aadhaar}
                touched={touched.aadhaar}
                disabled={isDisabled}
                inputRef={setFieldRef("aadhaar")}
              />
            </div>
          </section>

          {kycMethod === "upload" ? (
          <section className="card slide-up delay-1">
            <h2>Document Uploads</h2>
            <div className="upload-grid">
              <UploadBox
                label="PAN Card Upload"
                file={uploads.panFile}
                onFileSelect={(file) => handleUpload("panFile", file)}
                documentType="pancard"
                accept=".jpg,.jpeg,.png,.pdf"
                disabled={isDisabled}
                loading={ocrLoading}
              />
              <UploadBox
                label="Aadhaar Card Upload"
                file={uploads.aadhaarFile}
                onFileSelect={(file) => handleUpload("aadhaarFile", file)}
                documentType="aadhaar"
                accept=".jpg,.jpeg,.png,.pdf"
                disabled={isDisabled}
              />
              <UploadBox
                label="Bank Statement Upload"
                file={uploads.bankStatementFile}
                onFileSelect={(file) => handleUpload("bankStatementFile", file)}
                documentType="bankstatement"
                accept=".jpg,.jpeg,.png,.pdf"
                disabled={isDisabled}
              />
            </div>
          </section>
          ) : null}

          <section className="actions slide-up delay-2">
            {successMessage ? <p className="status-message">{successMessage}</p> : null}
            <div className="button-row">
              <button
                className="submit-btn"
                type="submit"
                //disabled={!isFormValid || isDisabled}
              >
                Submit KYC
              </button>
              <button
                className="reset-btn"
                type="button"
                onClick={resetAll}
                disabled={isDisabled}
              >
                Reset Form
              </button>
            </div>
            {submitting ? <Loader stageIndex={processingStageIndex} /> : null}
          </section>
        </form>

        <ResultModal
          open={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          result={result}
        />
      </div>

      <DigiLockerFlowModal
        open={isDigiLockerModalOpen}
        onClose={() => setIsDigiLockerModalOpen(false)}
        onComplete={completeDigiLockerFetch}
        loading={digilockerLoading}
      />
      </main>
    </>
  );
}
