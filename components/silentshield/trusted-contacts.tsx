"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { User, Phone, MessageSquare, Plus, X, Check, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Contact {
  id: string
  name: string
  phone: string
  relationship: string
  isNotified?: boolean
}

interface TrustedContactsProps {
  contacts: Contact[]
  onAddContact: (contact: Omit<Contact, "id">) => void
  onRemoveContact: (id: string) => void
  emergencyActive?: boolean
}

export function TrustedContacts({ contacts, onAddContact, onRemoveContact, emergencyActive }: TrustedContactsProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "" })

  const handleAdd = () => {
    if (newContact.name && newContact.phone) {
      onAddContact(newContact)
      setNewContact({ name: "", phone: "", relationship: "" })
      setIsAdding(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white/80 backdrop-blur-sm shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Trusted Contacts
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="text-primary hover:text-primary/80"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </Button>
      </div>

      {/* Add contact form */}
      {isAdding && (
        <div className="mb-4 p-4 rounded-lg bg-muted/30 border border-border space-y-3">
          <Input
            placeholder="Name"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            className="bg-background"
          />
          <Input
            placeholder="Phone number"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            className="bg-background"
          />
          <Input
            placeholder="Relationship (e.g., Mom, Friend)"
            value={newContact.relationship}
            onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
            className="bg-background"
          />
          <Button onClick={handleAdd} className="w-full" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      )}

      {/* Contacts list */}
      <div className="space-y-2">
        {contacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No trusted contacts added</p>
            <p className="text-xs">Add contacts who will be notified in emergencies</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-all",
                emergencyActive && contact.isNotified
                  ? "bg-destructive/10 border-destructive/50"
                  : "bg-muted/20 border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  emergencyActive && contact.isNotified
                    ? "bg-destructive/20 text-destructive"
                    : "bg-primary/20 text-primary"
                )}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {contact.relationship} • {contact.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {emergencyActive && contact.isNotified ? (
                  <div className="flex items-center gap-1 text-destructive">
                    <Check className="w-4 h-4" />
                    <span className="text-xs">Notified</span>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveContact(contact.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Emergency hotlines */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
          Emergency Hotlines
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30">
            <Phone className="w-4 h-4 text-destructive" />
            <div>
              <p className="text-xs font-medium text-destructive">Police</p>
              <p className="text-xs text-muted-foreground">100</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30">
            <Phone className="w-4 h-4 text-destructive" />
            <div>
              <p className="text-xs font-medium text-destructive">Women Helpline</p>
              <p className="text-xs text-muted-foreground">181</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border border-warning/30">
            <Phone className="w-4 h-4 text-warning" />
            <div>
              <p className="text-xs font-medium text-warning">Ambulance</p>
              <p className="text-xs text-muted-foreground">108</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/30">
            <Phone className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs font-medium text-primary">Emergency</p>
              <p className="text-xs text-muted-foreground">112</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
