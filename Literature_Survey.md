# Literature Survey: Network Forensics and Cyber Investigation Platforms

## 1. Introduction

The domain of network forensics and cybersecurity investigation is supported by a wide array of tools ranging from raw packet analyzers to complex Security Information and Event Management (SIEM) systems. This literature survey evaluates the capabilities, advantages, and limitations of the most prominent existing tools in the industry to establish the foundation and necessity for **TraceIQ**.

---

## 2. Packet Analyzers and Network Security Monitors

### 2.1 Wireshark
**Overview:** Wireshark is the industry-standard network protocol analyzer. It allows users to capture and interactively browse the traffic running on a computer network.
- **Advantages:** 
  - Unparalleled deep packet inspection (DPI) capabilities.
  - Supports hundreds of protocols.
  - Open-source with a massive community and extensive documentation.
- **Limitations:**
  - Highly manual and lacks automated threat correlation.
  - No built-in alerting or high-level incident timelines.
  - The interface can be overwhelming for large PCAP files, leading to "analysis paralysis."

### 2.2 Zeek (formerly Bro)
**Overview:** Zeek is a passive, open-source network traffic analyzer. Rather than just capturing packets, it interprets network traffic and generates compact, high-fidelity transaction logs.
- **Advantages:**
  - Highly customizable via the Zeek scripting language.
  - Excellent at extracting protocol metadata and generating actionable logs.
  - Scalable for large enterprise networks.
- **Limitations:**
  - Lacks a native graphical user interface (GUI) for investigation; relies on external tools like ELK for visualization.
  - Focuses on logging rather than providing a holistic investigation workspace.
  - Does not inherently stitch logs together into a unified attack narrative.

### 2.3 Suricata
**Overview:** Suricata is an open-source, high-performance Network Threat Detection engine that functions as an Intrusion Detection System (IDS), Intrusion Prevention System (IPS), and network security monitoring engine.
- **Advantages:**
  - High performance through multi-threading.
  - Rule-based detection using standard signature formats.
  - Capable of automatic protocol detection.
- **Limitations:**
  - Primarily an alerting engine. Once an alert is triggered, the analyst must still manually investigate the underlying PCAP.
  - Signature-based detection can struggle with zero-day attacks or heavily obfuscated traffic.

### 2.4 Security Onion
**Overview:** Security Onion is a free and open Linux distribution for threat hunting, enterprise security monitoring, and log management. It bundles tools like Zeek, Suricata, Elasticsearch, Logstash, and Kibana (ELK).
- **Advantages:**
  - Provides a comprehensive suite of tools pre-configured to work together.
  - Excellent for organizations that want an all-in-one open-source SOC infrastructure.
- **Limitations:**
  - Very steep learning curve and highly resource-intensive.
  - Complex to deploy, maintain, and tune.
  - It is an integration of multiple disparate tools rather than a single, purpose-built platform focused specifically on the PCAP investigation workflow.

---

## 3. Security Information and Event Management (SIEM) Systems

### 3.1 Splunk
**Overview:** Splunk is a leading enterprise platform for searching, monitoring, and analyzing machine-generated big data, via a web-style interface.
- **Advantages:**
  - Incredibly powerful search and correlation capabilities using SPL (Search Processing Language).
  - Vast ecosystem of apps and integrations.
- **Limitations:**
  - Prohibitively expensive licensing models based on data ingestion volume.
  - While excellent for log analysis, it is not inherently designed for raw PCAP visualization and packet-level forensic replay.

### 3.2 Microsoft Sentinel
**Overview:** Microsoft Sentinel is a cloud-native SIEM and Security Orchestration, Automation, and Response (SOAR) solution.
- **Advantages:**
  - Seamless integration with the Microsoft Azure and Microsoft 365 ecosystems.
  - Built-in AI and machine learning for threat detection.
- **Limitations:**
  - Vendor lock-in; optimized primarily for Azure environments.
  - Requires significant configuration to ingest and effectively analyze raw network packet captures compared to cloud logs.

### 3.3 Elastic Security
**Overview:** Built on the ELK Stack, Elastic Security combines SIEM and endpoint security, allowing users to investigate and respond to threats using the speed of Elasticsearch.
- **Advantages:**
  - Extremely fast search capabilities.
  - Flexible open-core model.
- **Limitations:**
  - Requires significant engineering effort to maintain the Elasticsearch clusters.
  - Rule management and alert tuning can become highly complex at scale.

### 3.4 IBM QRadar
**Overview:** IBM QRadar is a traditional, enterprise-grade SIEM that provides network security intelligence and analytics.
- **Advantages:**
  - Strong out-of-the-box correlation rules and threat intelligence integration.
  - Excellent compliance reporting.
- **Limitations:**
  - Legacy user interface that can feel clunky compared to modern web applications.
  - High total cost of ownership (TCO) and requires specialized training to operate effectively.

---

## 4. Research Gap

The literature and tool survey reveals a significant dichotomy in the current cybersecurity ecosystem:
1. **Low-Level Tools (Wireshark, Zeek):** Provide the necessary granular data but lack automated correlation, intuitive visualization, and workflow management.
2. **High-Level Tools (Splunk, Sentinel):** Excel at log aggregation and correlation but abstract away the raw packet data, making deep-dive network forensics cumbersome.

**Identified Gaps:**
- **Lack of Workflow-Centric PCAP Analysis:** There is a distinct lack of tools that take a raw PCAP file and provide a complete, end-to-end investigation workflow (parsing -> detection -> correlation -> evidence locking -> reporting) within a single UI.
- **Absence of Native AI Assistance:** Most traditional packet analyzers do not utilize Generative AI to bridge the knowledge gap for junior analysts, leaving the interpretation of complex binary protocols entirely up to the user.
- **Poor Narrative Reconstruction:** Existing tools present lists of alerts or packets, but fail to visually reconstruct the chronological narrative (Attack Replay) of how an incident unfolded across the network.

---

## 5. Need for TraceIQ

**TraceIQ** is proposed to directly address these research gaps. It is designed not to replace SIEMs, but to revolutionize the specific domain of **Network Forensics and PCAP Investigation**. 

By ingesting PCAP files and applying a layer of automated parsing, threat detection, and incident correlation, TraceIQ elevates raw data into a visual investigation. Furthermore, the integration of an AI Investigation Assistant ensures that analysts have immediate, contextual explanations of malicious behavior, drastically reducing the time required to close a case. The built-in Evidence Locker and automated Reports module ensure that the chain of custody is maintained and that findings are easily communicable to stakeholders.

---

## 6. Comparison Table

| Feature / Tool | Wireshark | Zeek / Suricata | Splunk / SIEMs | **TraceIQ** |
|----------------|-----------|-----------------|----------------|-------------|
| **Deep Packet Inspection** | Excellent | Good | Limited | **Excellent** |
| **Log/Alert Generation** | None | Excellent | Excellent | **Excellent** |
| **Investigation Workspace**| None | None | Good | **Excellent** |
| **Incident Correlation** | None | Limited | Excellent | **Excellent** |
| **Attack Replay Engine** | None | None | None | **Yes (Visual)** |
| **Generative AI Assistant**| None | None | Add-on/Costly | **Native Integration** |
| **Evidence Locker** | None | None | Limited | **Yes** |
| **User Interface** | Cluttered/Technical| CLI/No GUI | Complex | **Modern, Intuitive, Web-Based** |

---

## 7. References

1. Orebaugh, A., Ramirez, G., & Beale, J. (2006). *Wireshark & Ethereal Network Protocol Analyzer Toolkit*. Syngress.
2. Roesch, M. (1999). *Snort: Lightweight Intrusion Detection for Networks*. Proceedings of LISA '99: 13th Systems Administration Conference.
3. Paxson, V. (1999). *Bro: a system for detecting network intruders in real-time*. Computer Networks, 31(23-24), 2435-2463.
4. Chuvakin, A., Schmidt, K., & Phillips, C. (2013). *Logging and Log Management: The Authoritative Guide to Understanding the Concepts Surrounding Logging and Log Management*. Newnes.
5. Elastic. (n.d.). *Elastic Security Overview*. Retrieved from https://www.elastic.co/security
6. Microsoft. (n.d.). *Microsoft Sentinel Documentation*. Retrieved from https://learn.microsoft.com/en-us/azure/sentinel/
