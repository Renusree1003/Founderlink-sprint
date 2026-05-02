import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { createConversation, getConversations, getMessages, sendMessage, deleteConversation, toMessage, getUserById, getUserByUsername } from "../lib/api";
import { MessageSquare, Send, Plus, Trash2 } from "lucide-react";

export default function MessagingPage() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const userId = Number(user?.sub || user?.userId || 0);

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [showNew, setShowNew] = useState(false);
  const [otherUsername, setOtherUsername] = useState("");
  const [creating, setCreating] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    getConversations(userId)
      .then(async (data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        
        // Lazy fetch names for legacy conversations that don't have them stored
        const enriched = await Promise.all(list.map(async (c) => {
          if (c.user1Name && c.user2Name) return c;
          try {
            const otherId = c.user1Id === userId ? c.user2Id : c.user1Id;
            const otherUser = await getUserById(otherId);
            return {
              ...c,
              user1Name: c.user1Id === userId ? (profile?.fullName || profile?.username || profile?.name || "Me") : (otherUser?.fullName || otherUser?.username || otherUser?.name),
              user2Name: c.user1Id === userId ? (otherUser?.fullName || otherUser?.username || otherUser?.name) : (profile?.fullName || profile?.username || profile?.name || "Me")
            };
          } catch {
            return c;
          }
        }));
        
        if (active) setConversations(enriched);
      })
      .catch(() => { if (active) setConversations([]); });
    return () => { active = false; };
  }, [userId, profile]);

  useEffect(() => {
    if (location.state?.targetUserId) {
      setOtherUsername(location.state.targetUserId.toString());
      setShowNew(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (!activeConvId) return;
    let active = true;
    setLoading(true);
    getMessages(activeConvId)
      .then((data) => { if (active) setMessages(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setMessages([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [activeConvId]);

  async function onCreateConversation(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const targetUser = await getUserByUsername(otherUsername.trim());
      const targetName = targetUser?.fullName || targetUser?.username || targetUser?.name || `User #${targetUser?.id}`;
      
      const conv = await createConversation({ 
        user1Id: userId, 
        user1Name: profile?.fullName || profile?.username || profile?.name || `User #${userId}`,
        user2Id: Number(targetUser.id),
        user2Name: targetName
      });
      setConversations((prev) => {
        const exists = prev.find((c) => c.id === conv.id);
        return exists ? prev : [...prev, conv];
      });
      setActiveConvId(conv.id);
      setShowNew(false);
      setOtherUsername("");
    } catch (err) {
      alert(toMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function onDeleteConversation(e, convId) {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
    try {
      await deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConvId === convId) {
        setActiveConvId(null);
        setMessages([]);
      }
    } catch (err) {
      alert(toMessage(err));
    }
  }

  async function onSend(e) {
    e.preventDefault();
    if (!newMsg.trim() || !activeConvId) return;
    try {
      const msg = await sendMessage({ conversationId: activeConvId, senderId: userId, content: newMsg.trim() });
      setMessages((prev) => [...prev, msg]);
      setNewMsg("");
    } catch (err) {
      alert(toMessage(err));
    }
  }

  return (
    <Layout title="Messages">
      <div className="chat-layout">
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Messages</span>
            <button className="btn btn-ghost" onClick={() => setShowNew(!showNew)} title="New Conversation">
              <Plus size={18} />
            </button>
          </div>

          {showNew && (
            <form onSubmit={onCreateConversation} style={{ padding: "0.75rem", borderBottom: "1px solid var(--border-primary)", display: "flex", gap: "0.35rem" }}>
              <input className="form-input" type="text" placeholder="Username" value={otherUsername} onChange={(e) => setOtherUsername(e.target.value)} required style={{ fontSize: "0.82rem", padding: "0.45rem" }} />
              <button className="btn btn-primary btn-sm" disabled={creating}>{creating ? "..." : "Go"}</button>
            </form>
          )}

          <div className="chat-list">
            {conversations.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No conversations yet. Start one.
              </div>
            ) : (
              conversations.map((c) => (
                <div key={c.id} className={`chat-item${activeConvId === c.id ? " active" : ""}`} onClick={() => setActiveConvId(c.id)} style={{ position: "relative" }}>
                  <div className="user-avatar" style={{ width: 36, height: 36, fontSize: "0.75rem", background: "var(--brand-100)", color: "var(--brand-700)" }}>
                    {(c.user1Id === userId ? (c.user2Name || "?")[0] : (c.user1Name || "?")[0]).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                      {c.user1Id === userId ? (c.user2Name || `User #${c.user2Id}`) : (c.user1Name || `User #${c.user1Id}`)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Conversation #{c.id}</div>
                  </div>
                  <button className="btn btn-ghost btn-xs text-error" onClick={(e) => onDeleteConversation(e, c.id)} title="Delete" style={{ padding: "4px" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-main">
          {!activeConvId ? (
            <EmptyState icon={MessageSquare} title="Select a Conversation" subtitle="Choose a conversation from the sidebar or start a new one." />
          ) : (
            <>
              <div className="chat-messages">
                {loading ? (
                  <div className="loading-center"><div className="spinner" /></div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No messages yet. Say hello.</div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`chat-bubble ${m.senderId === userId ? "sent" : "received"}`}>
                      <div>{m.content}</div>
                      {m.timestamp && <div className="time">{new Date(m.timestamp).toLocaleTimeString()}</div>}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-bar" onSubmit={onSend}>
                <input type="text" placeholder="Type a message..." value={newMsg} onChange={(e) => setNewMsg(e.target.value)} autoFocus />
                <button className="btn btn-primary" type="submit" style={{ borderRadius: "var(--radius-round)", padding: "0.65rem 1rem" }}>
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
