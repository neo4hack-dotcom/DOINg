
import React, { useState, useRef } from 'react';
import { AppState, LLMConfig, User } from '../types';
import { DEFAULT_PROMPTS } from '../services/llmService';
import { clearState } from '../services/storage';
import { Save, Cpu, Key, Link, Download, Upload, Database, Settings, Lock, TestTube, Trash2, AlertOctagon, MessageSquare, RotateCcw } from 'lucide-react';

interface SettingsPanelProps {
  config: LLMConfig;
  appState: AppState | null; 
  onSave: (config: LLMConfig, prompts?: Record<string, string>) => void;
  onImport: (newState: AppState) => void;
  onInjectData?: () => void; 
  onUpdateUserPassword?: (userId: string, newPass: string) => void; 
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, appState, onSave, onImport, onUpdateUserPassword, onInjectData }) => {
  const [localConfig, setLocalConfig] = useState<LLMConfig>(config);
  const [localPrompts, setLocalPrompts] = useState<Record<string, string>>(appState?.prompts || {});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [activeTab, setActiveTab] = useState<'general' | 'prompts'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');

  const handleSave = () => {
    onSave(localConfig, localPrompts);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handlePasswordReset = () => {
      if (selectedUserId && newPassword && onUpdateUserPassword) {
          onUpdateUserPassword(selectedUserId, newPassword);
          alert('Mot de passe mis à jour');
          setNewPassword('');
          setSelectedUserId('');
      }
  };

  const handleExport = () => {
    if (!appState) return;
    const dataStr = JSON.stringify(appState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `doing_backup_${new Date().toISOString().slice(0,10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileObj = event.target.files && event.target.files[0];
      if (!fileObj) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const content = e.target?.result;
              if (typeof content === 'string') {
                  const parsedState = JSON.parse(content);
                  if (parsedState.users && parsedState.teams) {
                      if (window.confirm("Écraser les données actuelles ?")) {
                          onImport(parsedState);
                      }
                  }
              }
          } catch (error) {
              alert("Erreur lecture fichier.");
          }
      }
      reader.readAsText(fileObj);
      event.target.value = '';
  }

  const handleResetApp = () => {
      if (window.confirm("DANGER : Supprimer TOUTES les données ?")) {
          clearState();
      }
  }

  const handleResetPrompt = (key: string) => {
      if(window.confirm(`Réinitialiser le prompt "${key}" ?`)) {
          const newPrompts = { ...localPrompts };
          delete newPrompts[key];
          setLocalPrompts(newPrompts);
      }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-700 pb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configuration</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Système, sécurité et IA.</p>
          </div>
      </div>

      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl w-fit mb-6">
          <button onClick={() => setActiveTab('general')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Général & IA</button>
          <button onClick={() => setActiveTab('prompts')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'prompts' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}><MessageSquare className="w-4 h-4"/> Prompts</button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-8">

        {activeTab === 'prompts' ? (
            <div className="space-y-8 animate-in fade-in">
                {Object.entries(DEFAULT_PROMPTS).map(([key, defaultPrompt]) => (
                    <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{key.replace('_', ' ')}</label>
                            {localPrompts[key] && <button onClick={() => handleResetPrompt(key)} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Reset</button>}
                        </div>
                        <textarea 
                            value={localPrompts[key] || defaultPrompt}
                            onChange={(e) => setLocalPrompts({ ...localPrompts, [key]: e.target.value })}
                            className="w-full h-48 p-4 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                        />
                    </div>
                ))}
                <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold">Sauvegarder Prompts</button></div>
            </div>
        ) : (
            <>
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-indigo-500" /> Sécurité</h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700/50 flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Utilisateur</label>
                        <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full p-2.5 rounded-lg border dark:bg-slate-800 dark:text-white">
                            <option value="">Choisir...</option>
                            {appState?.users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nouveau Password</label>
                        <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2.5 rounded-lg border dark:bg-slate-800 dark:text-white" />
                    </div>
                    <button onClick={handlePasswordReset} disabled={!selectedUserId || !newPassword} className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg disabled:opacity-50">Maj</button>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Cpu className="w-5 h-5 text-indigo-500" /> Intelligence Artificielle</h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Endpoint HTTP API (Bridge)</label>
                        <div className="relative">
                            <Link className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                            <input type="text" value={localConfig.baseUrl} onChange={e => setLocalConfig({...localConfig, baseUrl: e.target.value})} className="w-full p-3 pl-10 rounded-lg border dark:bg-slate-800 dark:text-white" placeholder="http://127.0.0.1:8000/v1/chat/completions" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Modèle</label>
                        <input type="text" value={localConfig.model} onChange={e => setLocalConfig({...localConfig, model: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-slate-800 dark:text-white" placeholder="llama3 / gpt-3.5-turbo" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Clé API (Optionnelle)</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                            <input type="password" value={localConfig.apiKey} onChange={e => setLocalConfig({...localConfig, apiKey: e.target.value})} className="w-full p-3 pl-10 rounded-lg border dark:bg-slate-800 dark:text-white" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold">{saveStatus === 'saved' ? 'Enregistré !' : 'Enregistrer IA'}</button></div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Database className="w-5 h-5 text-indigo-500" /> Données</h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700/50 flex gap-3">
                    <button onClick={handleExport} className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg text-sm font-medium"><Download className="w-4 h-4 mr-2" /> Export JSON</button>
                    <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    <button onClick={handleImportClick} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"><Upload className="w-4 h-4 mr-2" /> Import JSON</button>
                    <button onClick={handleResetApp} className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium"><Trash2 className="w-4 h-4 mr-2" /> Reset App</button>
                </div>
            </div>
            </>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
