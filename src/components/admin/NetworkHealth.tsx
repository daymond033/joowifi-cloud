import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Cpu,
  HardDrive,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Thermometer,
  Zap,
  RotateCcw,
  Radio,
} from 'lucide-react';

export const NetworkHealth: React.FC = () => {
  const {
    routers,
    zones,
    heartbeatSecondsRemaining,
    pingRouter,
    rebootRouter,
    reconcileProfiles,
    notify,
  } = useApp();

  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [pingLatencies, setPingLatencies] = useState<Record<string, number>>({});
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [syncingProfiles, setSyncingProfiles] = useState(false);

  const filteredRouters = routers.filter(
    (r) => selectedZone === 'all' || r.zoneId === selectedZone || r.zoneName === selectedZone
  );

  const totalDownMbps = Number(
    filteredRouters.reduce((acc, r) => acc + r.trafficDownMbps, 0).toFixed(1)
  );
  const totalUpMbps = Number(
    filteredRouters.reduce((acc, r) => acc + r.trafficUpMbps, 0).toFixed(1)
  );
  const avgCpu = Math.round(
    filteredRouters.reduce((acc, r) => acc + r.cpuUsage, 0) / (filteredRouters.length || 1)
  );
  const avgRam = Math.round(
    filteredRouters.reduce((acc, r) => acc + r.ramUsage, 0) / (filteredRouters.length || 1)
  );

  const handlePing = async (routerId: string, routerName: string) => {
    setPingingId(routerId);
    const res = await pingRouter(routerId);
    setPingingId(null);
    if (res.success) {
      setPingLatencies((prev) => ({ ...prev, [routerId]: res.latencyMs }));
      notify(`Heartbeat ${routerName} vérifié (${res.latencyMs} ms).`, 'success');
    }
  };

  const handleSyncAll = async () => {
    setSyncingProfiles(true);
    await reconcileProfiles();
    setSyncingProfiles(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <span>Santé & Télémétrie du Réseau MikroTik</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Surveillance continue du trafic descendant/montant, charge CPU/RAM, capteurs thermiques et synchronisation Pull 45s.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Toutes les zones ({zones.length})</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSyncAll}
            disabled={syncingProfiles}
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingProfiles ? 'animate-spin' : ''}`} />
            <span>Synchroniser Profils</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/20 text-xs font-mono tabular-nums">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400">Pull :</span>
            <span className="text-emerald-400 font-bold">{heartbeatSecondsRemaining}s</span>
          </div>
        </div>
      </div>

      {/* Aggregate Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Trafic Download</span>
            <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
            {totalDownMbps} <span className="text-xs font-normal text-slate-400">Mbps</span>
          </div>
          <p className="text-[11px] text-slate-500">Débit descendant cumulé en temps réel</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Trafic Upload</span>
            <ArrowUpCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono tabular-nums">
            {totalUpMbps} <span className="text-xs font-normal text-slate-400">Mbps</span>
          </div>
          <p className="text-[11px] text-slate-500">Débit montant cumulé en temps réel</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Charge CPU Moy.</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">{avgCpu}%</div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                avgCpu > 75 ? 'bg-rose-500' : 'bg-amber-400'
              }`}
              style={{ width: `${avgCpu}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Mémoire RAM</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">{avgRam}%</div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${avgRam}%` }}
            />
          </div>
        </div>
      </div>

      {/* Individual Router Telemetry Bars */}
      <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-5">
        <h2 className="text-base font-bold text-white">
          Télémétrie Détaillée par Routeur ({filteredRouters.length})
        </h2>

        <div className="space-y-4">
          {filteredRouters.map((router) => (
            <div
              key={router.id}
              className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4 text-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        router.status === 'online'
                          ? 'bg-emerald-400'
                          : router.status === 'warning'
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                    />
                    <h3 className="font-bold text-white text-sm">{router.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-white/10 text-[10px] text-amber-300 font-semibold">
                      {router.zoneName}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      RouterOS {router.routerOsVersion} • {router.model || 'MikroTik RB760iGS'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono tabular-nums">
                    <span>IP: {router.ipAddress}</span>
                    <span>MAC: {router.macAddress}</span>
                    <span className="flex items-center gap-1 text-amber-300">
                      <Thermometer className="w-3 h-3" /> {router.temperature || 41}°C
                    </span>
                    <span className="flex items-center gap-1 text-emerald-300">
                      <Zap className="w-3 h-3" /> {router.voltage || 24.1}V
                    </span>
                    {pingLatencies[router.id] && (
                      <span className="text-cyan-400 font-bold">
                        Latence : {pingLatencies[router.id]} ms
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
                    Uptime : {router.uptime}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
                    ↓ {router.trafficDownMbps} Mbps / ↑ {router.trafficUpMbps} Mbps
                  </span>
                  <button
                    onClick={() => handlePing(router.id, router.name)}
                    disabled={pingingId === router.id}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-cyan-400 font-sans font-semibold flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Radio className={`w-3.5 h-3.5 ${pingingId === router.id ? 'animate-ping' : ''}`} />
                    <span>Ping Cloud</span>
                  </button>
                  <button
                    onClick={() => rebootRouter(router.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-sans font-semibold flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reboot</span>
                  </button>
                </div>
              </div>

              {/* CPU & RAM progress */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-mono tabular-nums">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400 font-sans">
                    <span>Charge Processeur (CPU) :</span>
                    <strong className="text-white font-mono">{router.cpuUsage}%</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        router.cpuUsage > 75
                          ? 'bg-rose-500'
                          : router.cpuUsage > 50
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${router.cpuUsage}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400 font-sans">
                    <span>Occupation Mémoire (RAM) :</span>
                    <strong className="text-white font-mono">{router.ramUsage}%</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-500"
                      style={{ width: `${router.ramUsage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
