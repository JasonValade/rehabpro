import React from "react";
import { C } from "../../constants/colors";

export function PtPortalStyles() {
  return (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=Fira+Code:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${C.black}; color: ${C.bone}; }
        body { min-height: 100vh; }
        button, input { font: inherit; outline: none; }
        button:focus-visible, input:focus-visible { outline: 2px solid ${C.lime}; outline-offset: 3px; }
        button { cursor: pointer; }
        .pt-panel {
          background: ${C.panel};
          border: 1px solid ${C.rim};
          border-radius: 8px;
          padding: 18px;
          contain: layout paint style;
          content-visibility: auto;
          contain-intrinsic-size: auto 360px;
        }
        .pt-shell {
          min-height: 100vh;
          background: ${C.black};
          font-family: 'DM Sans', sans-serif;
          padding: 24px;
        }
        .pt-layout {
          max-width: 1440px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 18px;
        }
        .pt-sidebar {
          position: sticky;
          top: 24px;
          align-self: start;
          height: calc(100vh - 48px);
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 8px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          contain: layout paint;
        }
        .pt-header {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 8px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          flex-wrap: wrap;
        }
        .pt-header-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(112px, 1fr));
          gap: 10px;
          min-width: min(100%, 560px);
        }
        .pt-patient-row {
          width: 100%;
          border-radius: 8px;
          padding: 16px 18px;
          text-align: left;
          display: grid;
          gap: 14px;
          contain: layout paint style;
          content-visibility: auto;
          contain-intrinsic-size: auto 132px;
        }
        .pt-sidebar-button {
          width: 100%;
          border-radius: 7px;
          padding: 11px 12px;
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          color: ${C.muted};
          letter-spacing: 0.08em;
          text-align: left;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid ${C.rim};
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .pt-sidebar-button:hover,
        .pt-sidebar-button:focus-visible,
        .pt-sidebar-button[aria-current="page"] {
          border-color: ${C.limeMid};
          background: ${C.limeDim};
          color: ${C.lime};
        }
        .pt-queue-card {
          width: 100%;
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 8px;
          padding: 16px 18px;
          color: ${C.bone};
          text-align: left;
          display: grid;
          gap: 12px;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
          contain: layout paint style;
          content-visibility: auto;
          contain-intrinsic-size: auto 150px;
        }
        .pt-queue-card:hover,
        .pt-queue-card:focus-visible {
          border-color: ${C.limeMid};
          background: ${C.limeDim};
          transform: translateY(-1px);
        }
        .pt-dashboard-grid,
        .pt-dashboard-main-stack,
        .pt-dashboard-side-stack {
          display: grid;
          gap: 14px;
        }
        .pt-dashboard-focus-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(360px, 0.75fr);
          gap: 14px;
          align-items: start;
        }
        .pt-dashboard-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        .pt-dashboard-section-head {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 14px;
          margin-bottom: 14px;
        }
        .pt-dashboard-section-head > div:first-child > div:last-child {
          font-family: 'Bebas Neue', cursive;
          font-size: 26px;
          color: ${C.bone};
          line-height: 1;
          margin-top: 6px;
        }
        .pt-dashboard-priority-list,
        .pt-dashboard-compact-list,
        .pt-dashboard-gate-list {
          display: grid;
          gap: 10px;
        }
        .pt-dashboard-action-card {
          width: 100%;
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 8px;
          padding: 16px 18px;
          color: ${C.bone};
          display: grid;
          gap: 12px;
          contain: layout paint style;
          content-visibility: auto;
          contain-intrinsic-size: auto 180px;
        }
        .pt-session-prep-list {
          display: grid;
          gap: 10px;
        }
        .pt-session-prep-board-head {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 14px;
          margin-bottom: 14px;
        }
        .pt-session-prep-board-head > div:first-child > div:last-child {
          font-family: 'Bebas Neue', cursive;
          font-size: 26px;
          color: ${C.bone};
          line-height: 1;
          margin-top: 6px;
        }
        .pt-session-prep-card {
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 8px;
          padding: 16px 18px;
          display: grid;
          gap: 12px;
          contain: layout paint style;
          content-visibility: auto;
          contain-intrinsic-size: auto 260px;
        }
        .pt-session-prep-head {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 14px;
        }
        .pt-session-prep-patient {
          font-family: 'Bebas Neue', cursive;
          font-size: 24px;
          color: ${C.bone};
          line-height: 1;
        }
        .pt-session-prep-meta {
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          color: ${C.muted};
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 6px;
        }
        .pt-session-prep-note {
          color: ${C.bone};
          font-size: 13px;
          line-height: 1.45;
        }
        .pt-session-prep-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .pt-session-prep-grid > div {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 7px;
          padding: 12px;
          min-width: 0;
        }
        .pt-session-prep-value {
          font-family: 'Bebas Neue', cursive;
          font-size: 24px;
          color: ${C.bone};
          line-height: 1;
          margin-top: 7px;
        }
        .pt-session-prep-grid span {
          display: block;
          color: ${C.muted};
          font-size: 13px;
          line-height: 1.45;
          margin-top: 6px;
        }
        .pt-session-prep-checklist {
          list-style: none;
          display: grid;
          gap: 7px;
          margin-top: 9px;
        }
        .pt-session-prep-checklist li {
          position: relative;
          color: ${C.bone};
          font-size: 13px;
          line-height: 1.35;
          padding-left: 16px;
        }
        .pt-session-prep-checklist li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.55em;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: ${C.lime};
        }
        .pt-session-prep-actions {
          border-top: 1px solid ${C.rim};
          padding-top: 12px;
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
        }
        .pt-dashboard-action-row {
          border-top: 1px solid ${C.rim};
          padding-top: 12px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: end;
          gap: 14px;
        }
        .pt-dashboard-action-row > div:first-child > div:last-child {
          color: ${C.bone};
          font-size: 13px;
          line-height: 1.45;
          margin-top: 6px;
        }
        .pt-dashboard-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
        }
        .pt-dashboard-actions button,
        .pt-session-prep-actions button,
        .pt-dashboard-compact-row {
          border: 1px solid ${C.rim};
          border-radius: 7px;
          background: ${C.panel};
          color: ${C.bone};
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-dashboard-actions button {
          padding: 10px 11px;
        }
        .pt-session-prep-actions button {
          padding: 10px 11px;
        }
        .pt-dashboard-actions .pt-dashboard-review-button {
          border-color: ${C.limeMid};
          background: ${C.limeDim};
          color: ${C.lime};
        }
        .pt-session-prep-actions .pt-dashboard-review-button {
          border-color: ${C.limeMid};
          background: ${C.limeDim};
          color: ${C.lime};
        }
        .pt-session-prep-actions .pt-milestone-pass-button,
        .pt-session-prep-actions .pt-milestone-pass-button-active {
          border-color: ${C.limeMid};
          color: ${C.lime};
        }
        .pt-session-prep-actions .pt-milestone-pass-button-active {
          background: ${C.limeDim};
        }
        .pt-session-prep-actions .pt-milestone-fail-button,
        .pt-session-prep-actions .pt-milestone-fail-button-active {
          border-color: ${C.red}55;
          color: ${C.red};
        }
        .pt-session-prep-actions .pt-milestone-fail-button-active {
          background: ${C.redDim};
        }
        .pt-dashboard-actions .pt-dashboard-review-button:hover,
        .pt-dashboard-actions .pt-dashboard-review-button:focus-visible,
        .pt-session-prep-actions .pt-dashboard-review-button:hover,
        .pt-session-prep-actions .pt-dashboard-review-button:focus-visible {
          border-color: ${C.lime};
          background: ${C.limeMid};
        }
        .pt-dashboard-actions button:hover,
        .pt-dashboard-actions button:focus-visible,
        .pt-session-prep-actions button:hover,
        .pt-session-prep-actions button:focus-visible,
        .pt-dashboard-compact-row:hover,
        .pt-dashboard-compact-row:focus-visible {
          border-color: ${C.limeMid};
          background: ${C.limeDim};
        }
        .pt-dashboard-compact-row {
          width: 100%;
          padding: 13px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          text-align: left;
        }
        .pt-dashboard-compact-row > div:first-child {
          min-width: 0;
        }
        .pt-dashboard-compact-row > div:first-child > div {
          font-family: 'Bebas Neue', cursive;
          font-size: 20px;
          color: ${C.bone};
          line-height: 1;
          letter-spacing: 0;
          text-transform: none;
        }
        .pt-dashboard-compact-row span {
          display: block;
          margin-top: 6px;
          color: ${C.muted};
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          letter-spacing: 0;
          text-transform: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pt-dashboard-gate-row {
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 8px;
          padding: 14px;
          display: grid;
          gap: 12px;
          min-width: 0;
        }
        .pt-dashboard-gate-head {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 10px;
        }
        .pt-dashboard-gate-head > div:first-child {
          min-width: 0;
          font-family: 'Bebas Neue', cursive;
          font-size: 20px;
          color: ${C.bone};
          line-height: 1;
        }
        .pt-dashboard-gate-head span {
          display: block;
          margin-top: 6px;
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          line-height: 1.35;
        }
        .pt-dashboard-gate-title {
          color: ${C.bone};
          font-size: 13px;
          line-height: 1.4;
          margin-top: 10px;
        }
        .pt-dashboard-gate-signal {
          color: ${C.muted};
          font-size: 12px;
          line-height: 1.4;
          margin-top: 4px;
        }
        .pt-dashboard-gate-actions {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 7px;
        }
        .pt-dashboard-gate-actions button {
          border: 1px solid ${C.rim};
          border-radius: 7px;
          background: ${C.panel};
          color: ${C.bone};
          padding: 9px 8px;
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }
        .pt-dashboard-gate-actions .pt-milestone-pass-button,
        .pt-dashboard-gate-actions .pt-milestone-pass-button-active {
          border-color: ${C.limeMid};
          color: ${C.lime};
        }
        .pt-dashboard-gate-actions .pt-milestone-pass-button-active {
          background: ${C.limeDim};
        }
        .pt-dashboard-gate-actions .pt-milestone-fail-button,
        .pt-dashboard-gate-actions .pt-milestone-fail-button-active {
          border-color: ${C.red}55;
          color: ${C.red};
        }
        .pt-dashboard-gate-actions .pt-milestone-fail-button-active {
          background: ${C.redDim};
        }
        .pt-dashboard-gate-actions button:hover,
        .pt-dashboard-gate-actions button:focus-visible {
          border-color: ${C.limeMid};
          background: ${C.limeDim};
        }
        .pt-patient-avatar {
          width: 48px;
          height: 48px;
          border: 1px solid;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          font-family: 'Bebas Neue', cursive;
          font-size: 16px;
          line-height: 1;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
        }
        .pt-patient-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
          margin-top: 10px;
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          color: ${C.muted};
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .pt-patient-meta span {
          display: inline-flex;
          align-items: center;
          min-width: 0;
        }
        .pt-patient-meta span + span::before {
          content: '/';
          color: ${C.ghost};
          margin: 0 8px;
        }
        .pt-metric {
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 7px;
          padding: 12px 14px;
          min-height: 84px;
          min-width: 0;
        }
        .pt-metric-danger {
          border-color: ${C.red}55;
          background: ${C.redDim};
        }
        .pt-report-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .pt-history-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .pt-history-hero {
          border: 1px solid ${C.rimHi};
          background: linear-gradient(135deg, ${C.lift}, ${C.deep});
          border-radius: 8px;
          padding: 16px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 0.8fr);
          gap: 16px;
          margin-bottom: 12px;
        }
        .pt-history-hero-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: start;
        }
        .pt-history-hero-head > div:first-child > div:last-child {
          font-family: 'Bebas Neue', cursive;
          font-size: 32px;
          color: ${C.bone};
          line-height: 1;
          margin-top: 6px;
        }
        .pt-history-hero p,
        .pt-history-latest p {
          margin: 8px 0 0;
          color: ${C.muted};
          font-size: 13px;
          line-height: 1.5;
        }
        .pt-history-summary {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .pt-history-stat {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 7px;
          padding: 11px 12px;
          min-width: 0;
        }
        .pt-history-stat > div:nth-child(2) {
          font-family: 'Bebas Neue', cursive;
          font-size: 28px;
          line-height: 1;
          margin-top: 7px;
          overflow-wrap: anywhere;
        }
        .pt-history-stat span {
          display: block;
          color: ${C.muted};
          font-size: 11px;
          line-height: 1.35;
          margin-top: 5px;
        }
        .pt-history-latest {
          border: 1px solid ${C.rim};
          background: ${C.deep};
          border-radius: 8px;
          padding: 13px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 14px;
          align-items: start;
          margin-bottom: 12px;
        }
        .pt-history-latest > div:first-child > div:nth-child(2) {
          font-family: 'Bebas Neue', cursive;
          font-size: 24px;
          color: ${C.bone};
          line-height: 1;
          margin-top: 6px;
        }
        .pt-history-timeline {
          display: grid;
          gap: 10px;
        }
        .pt-history-timeline-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }
        .pt-history-timeline-head span {
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .pt-history-list {
          display: grid;
          gap: 10px;
        }
        .pt-timeline-item {
          display: grid;
          grid-template-columns: 18px minmax(0, 1fr);
          gap: 10px;
          position: relative;
          contain: layout paint style;
          content-visibility: auto;
          contain-intrinsic-size: auto 190px;
        }
        .pt-timeline-item::before {
          content: "";
          position: absolute;
          left: 8px;
          top: 24px;
          bottom: -10px;
          width: 1px;
          background: ${C.rim};
        }
        .pt-timeline-item:last-child::before {
          display: none;
        }
        .pt-timeline-marker {
          width: 17px;
          height: 17px;
          border: 1px solid var(--timeline-accent);
          background: ${C.deep};
          border-radius: 50%;
          margin-top: 16px;
          box-shadow: 0 0 0 4px ${C.black};
          position: relative;
          z-index: 1;
        }
        .pt-timeline-body {
          border: 1px solid ${C.rim};
          border-left: 3px solid var(--timeline-accent);
          background: ${C.deep};
          border-radius: 8px;
          padding: 13px;
          display: grid;
          gap: 11px;
          min-width: 0;
        }
        .pt-timeline-item-unread .pt-timeline-body {
          background: linear-gradient(135deg, ${C.redDim}, ${C.deep} 62%);
          border-color: ${C.red}55;
        }
        .pt-timeline-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: start;
        }
        .pt-timeline-title {
          font-family: 'Bebas Neue', cursive;
          font-size: 22px;
          color: ${C.bone};
          line-height: 1;
        }
        .pt-timeline-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
          margin-top: 6px;
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .pt-timeline-meta span + span::before {
          content: '/';
          color: ${C.ghost};
          margin: 0 8px;
        }
        .pt-timeline-signals {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .pt-timeline-note {
          margin: 0;
          color: ${C.bone};
          font-size: 13px;
          line-height: 1.55;
        }
        .pt-timeline-action {
          justify-self: start;
          padding: 10px 12px;
          border: 1px solid ${C.rim};
          border-radius: 7px;
          background: ${C.panel};
          color: ${C.bone};
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-timeline-action:hover,
        .pt-timeline-action:focus-visible {
          border-color: ${C.lime}66;
          background: ${C.limeDim};
        }
        .pt-selected-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 18px;
        }
        .pt-overview-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.9fr) minmax(220px, 0.7fr);
          gap: 12px;
        }
        .pt-overview-dashboard {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
          gap: 12px;
          align-items: stretch;
        }
        .pt-overview-dashboard > :first-child {
          grid-column: 1 / -1;
        }
        .pt-progress-check-hero {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 16px;
          align-items: center;
        }
        .pt-progress-score-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .pt-trend-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .pt-load-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }
        .pt-trend-badge {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 7px;
          padding: 11px 12px;
          min-width: 0;
        }
        .pt-progress-check-row {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 7px;
          padding: 11px 12px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
        }
        .pt-tabbar {
          display: flex;
          gap: 8px;
          padding: 6px;
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 8px;
          overflow-x: auto;
        }
        .pt-tab {
          flex: 1 0 auto;
          min-width: 120px;
          border: 1px solid transparent;
          border-radius: 6px;
          padding: 10px 12px;
          background: transparent;
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-tab[aria-selected="true"] {
          border-color: ${C.limeMid};
          background: ${C.limeDim};
          color: ${C.lime};
        }
        .pt-back-link {
          border: none;
          background: transparent;
          color: ${C.muted};
          padding: 2px 0;
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-back-link:hover,
        .pt-back-link:focus-visible {
          color: ${C.lime};
        }
        .pt-tab-content {
          min-height: 560px;
          display: grid;
        }
        .pt-tab-content > .pt-panel {
          min-height: 100%;
        }
        .pt-note-grid,
        .pt-plan-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }
        .pt-plan-hero {
          border: 1px solid ${C.rimHi};
          background:
            linear-gradient(135deg, ${C.lift}, ${C.deep} 58%),
            linear-gradient(90deg, color-mix(in srgb, var(--plan-risk-color) 18%, transparent), transparent);
          border-radius: 8px;
          padding: 16px;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(310px, 0.85fr);
          gap: 16px;
          align-items: stretch;
          margin-bottom: 14px;
          position: relative;
          overflow: hidden;
        }
        .pt-plan-hero::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 3px;
          background: linear-gradient(90deg, ${C.lime}, ${C.blue}, var(--plan-risk-color));
          opacity: 0.95;
        }
        .pt-plan-hero-main,
        .pt-plan-hero-side {
          position: relative;
          min-width: 0;
        }
        .pt-plan-hero-title {
          font-family: 'Bebas Neue', cursive;
          font-size: 38px;
          color: ${C.bone};
          line-height: 0.95;
          margin-top: 7px;
        }
        .pt-plan-hero-main p {
          margin: 9px 0 0;
          color: ${C.bone};
          font-size: 14px;
          line-height: 1.55;
          max-width: 680px;
        }
        .pt-plan-hero-side {
          display: grid;
          gap: 10px;
          align-content: start;
          justify-items: end;
        }
        .pt-plan-hero-rail {
          display: grid;
          gap: 9px;
          margin-top: 18px;
        }
        .pt-plan-hero-rail span {
          height: 32px;
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 7px;
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          padding: 0 10px;
          min-width: 0;
        }
        .pt-plan-hero-rail span::before {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: var(--rail-value);
          background: color-mix(in srgb, var(--rail-color) 24%, transparent);
          border-right: 1px solid color-mix(in srgb, var(--rail-color) 70%, transparent);
        }
        .pt-plan-hero-rail b {
          position: relative;
          color: ${C.bone};
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-plan-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          width: 100%;
        }
        .pt-plan-decision {
          border: 1px solid var(--decision-color);
          background: linear-gradient(135deg, color-mix(in srgb, var(--decision-color) 12%, ${C.deep}), ${C.deep});
          border-radius: 8px;
          padding: 15px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: center;
          margin-bottom: 14px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .pt-plan-decision > div:first-child > div {
          font-family: 'Bebas Neue', cursive;
          font-size: 30px;
          color: var(--decision-color);
          line-height: 1;
          margin-top: 6px;
        }
        .pt-plan-decision p {
          margin: 8px 0 0;
          color: ${C.bone};
          font-size: 13px;
          line-height: 1.45;
        }
        .pt-plan-decision-steps {
          display: grid;
          grid-template-columns: repeat(3, auto);
          gap: 6px;
        }
        .pt-plan-decision-steps span {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 7px;
          padding: 7px 9px;
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .pt-plan-decision-steps span.active {
          border-color: var(--decision-color);
          background: color-mix(in srgb, var(--decision-color) 16%, transparent);
          color: var(--decision-color);
        }
        .pt-overview-plan-card {
          display: grid;
          gap: 12px;
        }
        .pt-overview-plan-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: start;
        }
        .pt-overview-plan-title {
          font-family: 'Bebas Neue', cursive;
          font-size: 30px;
          color: ${C.bone};
          line-height: 1;
        }
        .pt-overview-plan-detail {
          margin-top: 7px;
          color: ${C.muted};
          font-size: 13px;
          line-height: 1.45;
        }
        .pt-overview-plan-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .pt-overview-plan-sections {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 7px;
        }
        .pt-overview-plan-sections button {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 7px;
          padding: 9px 10px;
          color: ${C.bone};
          display: flex;
          justify-content: space-between;
          gap: 8px;
          align-items: center;
          text-align: left;
        }
        .pt-overview-plan-sections button:hover,
        .pt-overview-plan-sections button:focus-visible {
          border-color: ${C.lime}66;
          background: ${C.limeDim};
        }
        .pt-overview-plan-sections button > span {
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${C.muted};
          line-height: 1.3;
        }
        .pt-plan-next {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 7px;
          padding: 11px 12px;
          min-width: 0;
          width: 100%;
        }
        .pt-plan-next div {
          color: ${C.bone};
          font-size: 13px;
          line-height: 1.45;
          margin-top: 8px;
        }
        .pt-plan-alert {
          border: 1px solid ${C.amber}55;
          background: ${C.amberDim};
          border-radius: 8px;
          padding: 12px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 8px 14px;
          align-items: center;
          margin-bottom: 12px;
        }
        .pt-plan-alert div {
          color: ${C.bone};
          font-size: 13px;
          line-height: 1.45;
        }
        .pt-plan-alert button {
          grid-row: 1 / span 2;
          grid-column: 2;
          border: 1px solid ${C.amber}66;
          background: ${C.panel};
          border-radius: 7px;
          color: ${C.bone};
          padding: 10px 12px;
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-weekly-plan {
          display: grid;
          gap: 10px;
          margin-bottom: 16px;
        }
        .pt-today-plan {
          display: grid;
          gap: 14px;
          margin-bottom: 18px;
          border: 1px solid ${C.rimHi};
          background: linear-gradient(180deg, ${C.deep}, ${C.black});
          border-radius: 8px;
          padding: 14px;
        }
        .pt-today-header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: start;
          padding-bottom: 12px;
          border-bottom: 1px solid ${C.rim};
        }
        .pt-today-header > div:first-child > div {
          font-family: 'Bebas Neue', cursive;
          font-size: 30px;
          color: ${C.bone};
          line-height: 1;
          margin-top: 6px;
        }
        .pt-today-header p {
          margin: 8px 0 0;
          color: ${C.muted};
          font-size: 13px;
          line-height: 1.5;
        }
        .pt-today-summary {
          display: grid;
          grid-template-columns: repeat(2, minmax(86px, 1fr));
          gap: 8px;
        }
        .pt-today-list {
          display: grid;
          gap: 8px;
        }
        .pt-today-list button {
          width: 100%;
          border: 1px solid ${C.rimHi};
          background: linear-gradient(90deg, ${C.panel}, ${C.deep});
          border-radius: 8px;
          padding: 12px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          color: ${C.bone};
          text-align: left;
          transition: border-color 160ms ease, transform 160ms ease, background 160ms ease;
        }
        .pt-today-list button:hover,
        .pt-today-list button:focus-visible {
          border-color: ${C.lime}66;
          background: ${C.limeDim};
          transform: translateY(-1px);
        }
        .pt-today-index {
          width: 34px;
          height: 34px;
          border: 1px solid ${C.lime}55;
          background: ${C.limeDim};
          border-radius: 7px;
          display: grid;
          place-items: center;
          color: ${C.lime};
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          font-weight: 700;
        }
        .pt-today-main {
          min-width: 0;
        }
        .pt-today-exercise {
          font-family: 'Bebas Neue', cursive;
          font-size: 22px;
          color: ${C.bone};
          line-height: 1;
        }
        .pt-today-dose {
          margin-top: 5px;
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          line-height: 1.35;
        }
        .pt-today-rationale {
          color: ${C.bone};
          font-size: 12px;
          line-height: 1.35;
          margin-top: 6px;
        }
        .pt-today-tags {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 6px;
        }
        .pt-weekly-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .pt-weekly-section {
          border: 1px solid ${C.rimHi};
          border-top: 2px solid var(--section-color);
          background: linear-gradient(180deg, ${C.deep}, ${C.panel});
          border-radius: 8px;
          padding: 12px;
          display: grid;
          gap: 10px;
          min-width: 0;
          color: ${C.bone};
          text-align: left;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.035);
          transition: border-color 160ms ease, transform 160ms ease, background 160ms ease;
        }
        .pt-weekly-section:hover,
        .pt-weekly-section:focus-visible {
          border-color: ${C.lime}66;
          transform: translateY(-1px);
        }
        .pt-weekly-section-active {
          border-color: ${C.lime};
          background: linear-gradient(180deg, ${C.limeDim}, ${C.deep});
        }
        .pt-weekly-section-head {
          display: grid;
          gap: 10px;
        }
        .pt-weekly-title {
          font-family: 'Bebas Neue', cursive;
          font-size: 21px;
          color: ${C.bone};
          line-height: 1;
        }
        .pt-weekly-cadence {
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          color: ${C.muted};
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 5px;
        }
        .pt-weekly-days {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 3px;
        }
        .pt-weekly-days span {
          height: 22px;
          border: 1px solid ${C.rim};
          border-radius: 5px;
          display: grid;
          place-items: center;
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 8px;
        }
        .pt-weekly-days span.active {
          border-color: var(--section-color);
          background: color-mix(in srgb, var(--section-color) 15%, transparent);
          color: var(--section-color);
        }
        .pt-weekly-exercises {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .pt-weekly-exercises span {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 6px;
          padding: 5px 7px;
          color: ${C.bone};
          font-size: 10px;
          line-height: 1.25;
        }
        .pt-plan-column {
          display: grid;
          gap: 11px;
          align-content: start;
          min-width: 0;
        }
        .pt-plan-column-header {
          border: 1px solid ${C.rimHi};
          background: ${C.lift};
          border-radius: 7px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }
        .pt-plan-column-header div div {
          font-family: 'Bebas Neue', cursive;
          font-size: 22px;
          color: ${C.bone};
          line-height: 1;
          margin-top: 6px;
        }
        .pt-assigned-exercise,
        .pt-add-exercise {
          border: 1px solid ${C.rimHi};
          background: ${C.deep};
          border-radius: 8px;
          padding: 13px;
          color: ${C.bone};
          text-align: left;
          display: grid;
          gap: 10px;
          min-width: 0;
        }
        .pt-assigned-exercise {
          padding: 0;
          overflow: hidden;
          background: linear-gradient(180deg, ${C.deep}, ${C.panel});
        }
        .pt-assigned-exercise-open {
          border-color: ${C.lime}44;
        }
        .pt-assigned-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 12px;
        }
        .pt-assigned-toggle {
          width: 100%;
          min-width: 0;
          border: none;
          background: transparent;
          color: ${C.bone};
          padding: 0;
          display: block;
          text-align: left;
        }
        .pt-assigned-row-main {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 10px;
          align-items: center;
          min-width: 0;
        }
        .pt-exercise-index {
          width: 32px;
          height: 32px;
          border: 1px solid var(--exercise-color);
          background: color-mix(in srgb, var(--exercise-color) 14%, transparent);
          border-radius: 7px;
          display: grid;
          place-items: center;
          color: var(--exercise-color);
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          font-weight: 700;
        }
        .pt-assigned-row-meta {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .pt-assigned-row-meta label {
          display: grid;
          gap: 4px;
        }
        .pt-assigned-row-meta label span {
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 8px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-assigned-row-meta select {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          color: ${C.bone};
          border-radius: 6px;
          padding: 7px 26px 7px 8px;
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          min-width: 118px;
        }
        .pt-assigned-purpose {
          border-top: 1px solid ${C.rim};
          padding: 10px 12px;
          color: ${C.bone};
          font-size: 12px;
          line-height: 1.45;
          background: rgba(255,255,255,0.015);
        }
        .pt-assigned-details {
          border-top: 1px solid ${C.rim};
          padding: 12px;
          display: grid;
          gap: 10px;
        }
        .pt-dose-editor {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }
        .pt-dose-editor label {
          display: grid;
          gap: 5px;
          min-width: 0;
        }
        .pt-dose-editor span {
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 8px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-dose-editor input {
          width: 100%;
          border: 1px solid ${C.rim};
          background: ${C.panel};
          color: ${C.bone};
          border-radius: 7px;
          padding: 9px 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
        }
        .pt-dose-editor input::placeholder {
          color: ${C.muted};
        }
        .pt-details-toggle {
          border: 1px solid ${C.blue}55;
          background: ${C.blueDim};
          color: ${C.blue};
          border-radius: 7px;
          padding: 9px 11px;
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-exercise-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
        .pt-exercise-detail-panel {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 8px;
          padding: 12px;
          overflow: hidden;
        }
        .pt-add-exercise {
          border-color: ${C.rimHi};
          background: linear-gradient(180deg, ${C.deep}, ${C.panel});
          transition: border-color 160ms ease, transform 160ms ease, background 160ms ease;
        }
        .pt-add-exercise:hover,
        .pt-add-exercise:focus-visible {
          border-color: ${C.lime};
          background: ${C.limeDim};
          transform: translateY(-1px);
        }
        .pt-exercise-main {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: start;
          min-width: 0;
        }
        .pt-exercise-main > div {
          min-width: 0;
        }
        .pt-exercise-title {
          font-family: 'Bebas Neue', cursive;
          font-size: 20px;
          color: ${C.bone};
          line-height: 1;
        }
        .pt-exercise-dose {
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          color: ${C.muted};
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-top: 6px;
          line-height: 1.4;
        }
        .pt-exercise-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .pt-exercise-meta span {
          border: 1px solid ${C.rim};
          border-radius: 999px;
          padding: 5px 7px;
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          line-height: 1.2;
        }
        .pt-exercise-cue {
          color: ${C.bone};
          font-size: 13px;
          line-height: 1.5;
        }
        .pt-plan-remove {
          justify-self: start;
          border: 1px solid ${C.rim};
          background: ${C.panel};
          color: ${C.muted};
          border-radius: 7px;
          padding: 8px 10px;
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pt-plan-remove:hover,
        .pt-plan-remove:focus-visible {
          color: ${C.red};
          border-color: ${C.red}55;
        }
        .pt-plan-search {
          width: 100%;
          border: 1px solid ${C.rim};
          background: ${C.deep};
          color: ${C.bone};
          border-radius: 7px;
          padding: 12px 13px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
        }
        .pt-plan-search::placeholder {
          color: ${C.muted};
        }
        .pt-plan-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }
        .pt-plan-filters button {
          border: 1px solid ${C.rim};
          background: ${C.panel};
          border-radius: 999px;
          color: ${C.muted};
          padding: 7px 9px;
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .pt-plan-filters button[aria-pressed="true"] {
          border-color: var(--category-color);
          background: ${C.limeDim};
          color: var(--category-color);
        }
        .pt-plan-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }
        .pt-plan-preview span {
          border: 1px solid ${C.rim};
          border-radius: 999px;
          padding: 6px 8px;
          color: ${C.muted};
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        @media (max-width: 1180px) {
          .pt-layout {
            grid-template-columns: 1fr;
          }
          .pt-sidebar {
            position: static;
            height: auto;
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
          }
          .pt-sidebar nav {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
          .pt-sidebar-actions {
            margin-top: 0 !important;
            grid-template-columns: 1fr;
          }
          .pt-plan-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .pt-weekly-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .pt-overview-grid {
            grid-template-columns: 1fr 1fr;
          }
          .pt-overview-dashboard {
            grid-template-columns: 1fr;
          }
          .pt-overview-dashboard > :first-child {
            grid-column: auto;
          }
          .pt-dashboard-focus-grid {
            grid-template-columns: 1fr;
          }
          .pt-dashboard-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 820px) {
          .pt-shell {
            padding: 14px;
          }
          .pt-sidebar {
            grid-template-columns: 1fr;
          }
          .pt-sidebar nav,
          .pt-header-metrics,
          .pt-selected-metrics,
          .pt-overview-grid,
          .pt-progress-score-row,
          .pt-trend-grid,
          .pt-history-metrics,
          .pt-history-hero,
          .pt-history-summary,
          .pt-history-latest,
          .pt-timeline-signals,
          .pt-note-grid,
          .pt-plan-grid,
          .pt-plan-hero,
          .pt-plan-decision,
          .pt-weekly-grid,
          .pt-plan-summary,
          .pt-dashboard-focus-grid,
          .pt-dashboard-summary,
          .pt-session-prep-grid,
          .pt-dashboard-action-row {
            grid-template-columns: 1fr;
          }
          .pt-dashboard-gate-actions {
            grid-template-columns: repeat(3, minmax(72px, 1fr));
          }
          .pt-dashboard-actions {
            justify-content: flex-start;
          }
          .pt-plan-hero-side {
            justify-items: stretch;
          }
          .pt-plan-decision-steps {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .pt-plan-decision-steps span {
            text-align: center;
          }
          .pt-today-header,
          .pt-today-list button {
            grid-template-columns: 1fr;
          }
          .pt-today-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .pt-today-tags {
            justify-content: flex-start;
          }
          .pt-overview-plan-head {
            flex-direction: column;
          }
          .pt-overview-plan-metrics,
          .pt-overview-plan-sections {
            grid-template-columns: 1fr;
          }
          .pt-assigned-row {
            grid-template-columns: 1fr;
          }
          .pt-assigned-row-meta {
            justify-content: flex-start;
          }
          .pt-dose-editor {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .pt-plan-alert {
            grid-template-columns: 1fr;
          }
          .pt-plan-alert button {
            grid-column: auto;
            grid-row: auto;
            justify-self: start;
          }
          .pt-load-grid {
            grid-template-columns: 1fr 1fr;
          }
          .pt-progress-check-hero,
          .pt-progress-check-row {
            grid-template-columns: 1fr;
          }
          .pt-header {
            align-items: stretch;
          }
          .pt-report-metrics {
            grid-template-columns: 1fr;
          }
          .pt-tab-content {
            min-height: 460px;
          }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.rim}; border-radius: 2px; }
      `}</style>
  );
}
