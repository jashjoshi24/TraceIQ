import React, { useState } from 'react';
import { PermissionGuard } from '../../components/Guards';
import { Modal } from '../../components/Modal';
import {
  HardDriveUpload,
  FileCode,
  CheckCircle2,
  ShieldAlert,
  Search,
  Filter,
  Activity,
  Layers,
  Terminal,
  Eye,
  AlertTriangle,
  Zap,
  Download,
  Database,
  ArrowRight,
} from 'lucide-react';

interface Packet {
  no: number;
  time: string;
  source: string;
  destination: string;
  protocol: 'TCP' | 'UDP' | 'DNS' | 'HTTP' | 'ICMP';
  length: number;
  threat: 'NORMAL' | 'SUSPICIOUS' | 'MALICIOUS';
  summary: string;
  hexPayload: string;
}

const mockPackets: Packet[] = [
  {
    no: 1,
    time: '0.000000',
    source: '192.168.1.104:49152',
    destination: '10.0.0.1:80',
    protocol: 'HTTP',
    length: 512,
    threat: 'MALICIOUS',
    summary: 'GET /admin/db_export.php?id=1%27%20OR%201=1-- HTTP/1.1 (SQL Injection)',
    hexPayload: '47 45 54 20 2f 61 64 6d 69 6e 2f 64 62 5f 65 78 70 6f 72 74 2e 70 68 70 3f 69 64 3d 31 25 32 37 20 4f 52 20 31 3d 31 2d 2d 20 48 54 54 50 2f 31 2e 31',
  },
  {
    no: 2,
    time: '0.004120',
    source: '192.168.1.104:51200',
    destination: '8.8.8.8:53',
    protocol: 'DNS',
    length: 128,
    threat: 'SUSPICIOUS',
    summary: 'Standard query A c2-server-exfil-node-99.malicious-domain.cc (DNS Tunneling)',
    hexPayload: '00 01 01 00 00 01 00 00 00 00 00 00 1a 63 32 2d 73 65 72 76 65 72 2d 65 78 66 69 6c 2d 6e 6f 64 65 2d 39 39 03 63 6f 6d 00 00 01 00 01',
  },
  {
    no: 3,
    time: '0.012540',
    source: '10.0.0.15:443',
    destination: '192.168.1.50:54120',
    protocol: 'TCP',
    length: 1460,
    threat: 'NORMAL',
    summary: '443 → 54120 [ACK] Seq=1461 Ack=513 Win=64240 Len=1400',
    hexPayload: '17 03 03 05 70 00 00 00 00 00 00 00 01 e2 a4 19 b8 92 11 cf a9 82 10 a7 c5 e3 11 02 99 a1 fe d2 88',
  },
  {
    no: 4,
    time: '0.018900',
    source: '192.168.1.104:58900',
    destination: '10.0.0.1:443',
    protocol: 'TCP',
    length: 64,
    threat: 'SUSPICIOUS',
    summary: '58900 → 443 [SYN, ECN, CWR] Seq=0 Win=1024 (SYN Flood probe)',
    hexPayload: 'e5 bc 01 bb 00 00 00 00 00 00 00 00 80 c2 04 00 3a c0 00 00 02 04 05 b4 01 03 03 08 01 01 04 02',
  },
  {
    no: 5,
    time: '0.025110',
    source: '192.168.1.12:123',
    destination: '162.159.200.1:123',
    protocol: 'UDP',
    length: 96,
    threat: 'NORMAL',
    summary: 'NTP Version 4, client request',
    hexPayload: '23 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 e5 bc a1 fe 00 00 00 00',
  },
];

export const PcapManager: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [activeSample, setActiveSample] = useState<string | null>(null);

  // Filter Toolbar State
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('ALL');
  const [threatFilter, setThreatFilter] = useState('ALL');

  // Inspection Modal State
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setActiveSample(selectedFile.name);
      runAnalysis();
    }
  };

  const loadSamplePcap = (sampleName: string) => {
    setActiveSample(sampleName);
    setFile(new File(['dummy binary pcap data'], sampleName, { type: 'application/octet-stream' }));
    runAnalysis();
  };

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setPackets(mockPackets);
    }, 1200);
  };

  // Filtered Packets
  const filteredPackets = packets.filter((p) => {
    const matchesSearch =
      p.source.toLowerCase().includes(search.toLowerCase()) ||
      p.destination.toLowerCase().includes(search.toLowerCase()) ||
      p.summary.toLowerCase().includes(search.toLowerCase());
    const matchesProtocol = protocolFilter === 'ALL' || p.protocol === protocolFilter;
    const matchesThreat = threatFilter === 'ALL' || p.threat === threatFilter;
    return matchesSearch && matchesProtocol && matchesThreat;
  });

  const totalBytes = packets.reduce((acc, p) => acc + p.length, 0);
  const suspiciousCount = packets.filter((p) => p.threat !== 'NORMAL').length;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">TraceIQ Packet Stream & PCAP Analyzer</h1>
          <p className="page-subtitle">Inspect network packet captures, parse TCP/UDP stream payloads, and identify threat signatures</p>
        </div>
      </div>

      <PermissionGuard
        permission="upload_pcap"
        fallback={
          <div className="glass-card">
            <div className="alert alert-danger">
              <ShieldAlert size={18} />
              <span>Permission Denied: Your assigned role does not hold the `upload_pcap` permission required to perform packet inspection.</span>
            </div>
          </div>
        }
      >
        {/* Upload & Sample Pre-loader Panel */}
        <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
            {/* Drag Drop Area */}
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                transition: 'border-color 0.2s ease',
              }}
            >
              <HardDriveUpload size={36} style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {activeSample ? `Active: ${activeSample}` : 'Upload PCAP File (.pcap / .pcapng)'}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max file size: 100MB</span>

              <div style={{ marginTop: '1rem' }}>
                <input type="file" accept=".pcap,.pcapng" id="pcap-upload-input" style={{ display: 'none' }} onChange={handleFileUpload} />
                <label htmlFor="pcap-upload-input" className="btn btn-primary" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                  Browse PCAP File
                </label>
              </div>
            </div>

            {/* Quick Sample Buttons */}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
                OR QUICK-LOAD THREAT SCENARIO DUMPS:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', fontSize: '0.85rem' }}
                  onClick={() => loadSamplePcap('sql_injection_attack.pcap')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileCode size={16} style={{ color: 'var(--accent-rose)' }} />
                    <span>SQL Injection Attack Dump</span>
                  </div>
                  <span className="badge badge-rose">MALICIOUS</span>
                </button>

                <button
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', fontSize: '0.85rem' }}
                  onClick={() => loadSamplePcap('dns_tunneling_exfil.pcap')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={16} style={{ color: 'var(--accent-amber)' }} />
                    <span>DNS Tunneling & Exfiltration</span>
                  </div>
                  <span className="badge badge-rose">SUSPICIOUS</span>
                </button>

                <button
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', fontSize: '0.85rem' }}
                  onClick={() => loadSamplePcap('normal_web_traffic.pcap')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={16} style={{ color: 'var(--accent-emerald)' }} />
                    <span>Clean Enterprise Web Traffic</span>
                  </div>
                  <span className="badge badge-emerald">CLEAN</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Summary Cards */}
        {packets.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>PARSED PACKETS</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {packets.length}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TRAFFIC VOLUME</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                {(totalBytes / 1024).toFixed(1)} KB
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>THREAT SIGNATURES</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: suspiciousCount > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                {suspiciousCount} Flagged
              </div>
            </div>
          </div>
        )}

        {/* Packet Inspector Toolbar */}
        {packets.length > 0 && (
          <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  placeholder="Filter by IP, Port, or Payload keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                <select
                  className="form-input"
                  value={protocolFilter}
                  onChange={(e) => setProtocolFilter(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', cursor: 'pointer' }}
                >
                  <option value="ALL">All Protocols</option>
                  <option value="HTTP">HTTP</option>
                  <option value="DNS">DNS</option>
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                </select>

                <select
                  className="form-input"
                  value={threatFilter}
                  onChange={(e) => setThreatFilter(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', cursor: 'pointer' }}
                >
                  <option value="ALL">All Threat Levels</option>
                  <option value="MALICIOUS">Malicious</option>
                  <option value="SUSPICIOUS">Suspicious</option>
                  <option value="NORMAL">Normal</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Packets Stream Table */}
        {isAnalyzing ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(6, 182, 212, 0.2)',
                borderTopColor: 'var(--accent-cyan)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem auto',
              }}
            />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Parsing Packet Stream Telemetry...</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Dissecting packet headers and verifying payload signatures</p>
          </div>
        ) : packets.length > 0 ? (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>No.</th>
                  <th style={{ width: '100px' }}>Time</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Proto</th>
                  <th>Length</th>
                  <th>Threat Level</th>
                  <th>Packet Info Summary</th>
                  <th style={{ textAlign: 'right' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackets.map((pkt) => (
                  <tr key={pkt.no}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pkt.no}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{pkt.time}</td>
                    <td>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{pkt.source}</code>
                    </td>
                    <td>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-primary)' }}>{pkt.destination}</code>
                    </td>
                    <td>
                      <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{pkt.protocol}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{pkt.length} B</td>
                    <td>
                      <span
                        className={`badge ${
                          pkt.threat === 'MALICIOUS'
                            ? 'badge-rose'
                            : pkt.threat === 'SUSPICIOUS'
                            ? 'badge-purple'
                            : 'badge-emerald'
                        }`}
                      >
                        {pkt.threat}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pkt.summary}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedPacket(pkt)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                      >
                        <Eye size={14} />
                        <span>Inspect Payload</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <FileCode size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Packet Capture Loaded</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem', maxWidth: '420px', margin: '0.4rem auto 1.5rem auto' }}>
              Upload a PCAP file above or select one of the threat scenario dumps to inspect packet payloads.
            </p>
          </div>
        )}

        {/* Inspection Modal */}
        <Modal isOpen={!!selectedPacket} onClose={() => setSelectedPacket(null)} title={`Packet Inspection: #${selectedPacket?.no} (${selectedPacket?.protocol})`}>
          {selectedPacket && (
            <div>
              <div style={{ marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-cyan">{selectedPacket.protocol}</span>
                  <span className={`badge ${selectedPacket.threat === 'MALICIOUS' ? 'badge-rose' : 'badge-emerald'}`}>{selectedPacket.threat}</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedPacket.summary}</div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  PAYLOAD HEX & ASCII DUMP:
                </span>
                <div
                  style={{
                    backgroundColor: '#05070d',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                    wordBreak: 'break-all',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {selectedPacket.hexPayload}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedPacket(null)}>
                  Close Inspection
                </button>
              </div>
            </div>
          )}
        </Modal>
      </PermissionGuard>
    </div>
  );
};
