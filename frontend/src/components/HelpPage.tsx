import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { helpAPI } from '../utils/api';

interface HelpPageProps {
  onBack: () => void;
}

export function HelpPage({ onBack }: HelpPageProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await helpAPI.getTickets();
        if (mounted) setTickets(res.tickets || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const submitTicket = async () => {
    if (!subject || !message) return;
    setSubmitting(true);
    try {
      const created = await helpAPI.createTicket(subject, message);
      setTickets((t) => [created, ...t]);
      setSubject('');
      setMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-blue-50/20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl text-gray-900">Help & Support</h1>
          <p className="text-gray-600">Submit a support request and view your tickets</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl text-gray-900 mb-4">Create a Ticket</h2>
          <div className="space-y-4">
            <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <Textarea placeholder="Describe your issue..." value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[120px]" />
            <Button onClick={submitTicket} disabled={!subject || !message || submitting} className="bg-rose-500 hover:bg-rose-600 text-white">
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl text-gray-900 mb-4">Your Tickets</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : tickets.length === 0 ? (
            <p className="text-gray-500">No tickets yet</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-gray-200">
                  <p className="text-gray-900 font-medium">{t.subject}</p>
                  <p className="text-gray-700 whitespace-pre-wrap mt-1">{t.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(t.createdAt).toLocaleString()} • {t.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
