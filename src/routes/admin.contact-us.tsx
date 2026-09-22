import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Loader2, Plus, Save, Trash2, ExternalLink } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useContactPageSettings,
  useContactInformationCards,
  useContactSocialLinks,
  saveContactPageSettings,
  upsertInfoCard,
  upsertContactSocialLink,
  deleteContactSocialLink,
  DEFAULT_INFO_CARDS,
  type ContactPageSettings,
  type InfoCard,
  type ContactSocialLink,
} from "@/lib/contact-page-settings";

export const Route = createFileRoute("/admin/contact-us")({
  head: () => ({ meta: [{ title: "Contact Us Management — Admin" }] }),
  component: ContactUsManagement,
});

function ContactUsManagement() {
  return (
    <AdminShell
      title="Contact Us Management"
      subtitle="Manage every piece of content shown on the public Contact Us page."
    >
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="info">Contact Information</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="form">Form Settings</TabsTrigger>
          <TabsTrigger value="terms">Terms & Agreement</TabsTrigger>
          <TabsTrigger value="categories">Service Categories</TabsTrigger>
          <TabsTrigger value="enquiries">Customer Enquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6"><InfoCardsEditor /></TabsContent>
        <TabsContent value="whatsapp" className="mt-6"><WhatsAppEditor /></TabsContent>
        <TabsContent value="social" className="mt-6"><SocialLinksEditor /></TabsContent>
        <TabsContent value="form" className="mt-6"><FormSettingsEditor /></TabsContent>
        <TabsContent value="terms" className="mt-6"><TermsEditor /></TabsContent>
        <TabsContent value="categories" className="mt-6">
          <RedirectPanel
            title="Service Categories & Services"
            body="Service categories and items shown in the Contact Us dropdowns are managed together with the site catalogue."
            to="/admin/services"
            label="Open Services Management"
          />
        </TabsContent>
        <TabsContent value="enquiries" className="mt-6">
          <RedirectPanel
            title="Customer Enquiries"
            body="View, filter, respond to and export every submitted Contact Us enquiry."
            to="/admin/contact"
            label="Open Enquiries Dashboard"
          />
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}

// ==================== Contact Information ====================

function InfoCardsEditor() {
  const { cards, refresh, loading } = useContactInformationCards();
  const seed = cards.length ? cards : DEFAULT_INFO_CARDS;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {seed.sort((a, b) => a.displayOrder - b.displayOrder).map((c) => (
        <InfoCardForm key={c.cardType} card={c} onSaved={refresh} />
      ))}
      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
    </div>
  );
}

function InfoCardForm({ card, onSaved }: { card: InfoCard; onSaved: () => void }) {
  const [state, setState] = useState<InfoCard>(card);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => setState(card), [card]);

  async function save() {
    setSaving(true);
    try {
      await upsertInfoCard(state);
      toast.success(`${state.title} saved`);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
      onSaved();
    } catch (e) {
      toast.error((e as Error).message || "Save failed");
    } finally { setSaving(false); }
  }

  function updateContent(patch: Record<string, unknown>) {
    setState({ ...state, content: { ...state.content, ...patch } });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-primary">{state.title} Card</h3>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Active</Label>
          <Switch checked={state.isActive} onCheckedChange={(v) => setState({ ...state, isActive: v })} />
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <FieldRow label="Card Title">
          <Input value={state.title} onChange={(e) => setState({ ...state, title: e.target.value })} />
        </FieldRow>
        <FieldRow label="Label / Subtitle">
          <Input value={state.label ?? ""} onChange={(e) => setState({ ...state, label: e.target.value })} />
        </FieldRow>

        {state.cardType === "phone" && (
          <PhoneNumbersEditor
            numbers={((state.content as Record<string, unknown>).numbers as { value: string; active: boolean }[]) ?? []}
            onChange={(numbers) => updateContent({ numbers })}
          />
        )}
        {state.cardType === "email" && (
          <>
            <FieldRow label="Primary Email">
              <Input
                type="email"
                value={(state.content as Record<string, string>).primary ?? ""}
                onChange={(e) => updateContent({ primary: e.target.value })}
              />
            </FieldRow>
            <FieldRow label="Secondary Email (optional)">
              <Input
                type="email"
                value={(state.content as Record<string, string>).secondary ?? ""}
                onChange={(e) => updateContent({ secondary: e.target.value })}
              />
            </FieldRow>
          </>
        )}
        {state.cardType === "support" && (
          <FieldRow label="Description">
            <Textarea
              value={(state.content as Record<string, string>).text ?? ""}
              onChange={(e) => updateContent({ text: e.target.value })}
            />
          </FieldRow>
        )}
        {state.cardType === "address" && (
          <>
            <FieldRow label="Address (one line per row)">
              <Textarea
                rows={4}
                value={(((state.content as Record<string, unknown>).lines as string[]) ?? []).join("\n")}
                onChange={(e) => updateContent({ lines: e.target.value.split("\n") })}
              />
            </FieldRow>
            <FieldRow label="Google Maps URL">
              <Input
                value={(state.content as Record<string, string>).maps_url ?? ""}
                onChange={(e) => updateContent({ maps_url: e.target.value })}
              />
            </FieldRow>
          </>
        )}

        <FieldRow label="Action URL (tel:/mailto:/https:)">
          <Input value={state.actionUrl ?? ""} onChange={(e) => setState({ ...state, actionUrl: e.target.value })} />
        </FieldRow>
        <FieldRow label="Display Order">
          <Input
            type="number"
            value={state.displayOrder}
            onChange={(e) => setState({ ...state, displayOrder: Number(e.target.value) })}
          />
        </FieldRow>

        <Button onClick={save} disabled={saving} className="mt-2 w-fit">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : justSaved ? <Check className="mr-2 h-4 w-4" />
            : <Save className="mr-2 h-4 w-4" />}
          {justSaved ? "Saved" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

function PhoneNumbersEditor({
  numbers, onChange,
}: { numbers: { value: string; active: boolean }[]; onChange: (v: { value: string; active: boolean }[]) => void }) {
  const list = numbers.length ? numbers : [{ value: "", active: true }];
  return (
    <div>
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Numbers</Label>
      <div className="mt-2 space-y-2">
        {list.map((n, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={n.value}
              placeholder="Phone number"
              onChange={(e) => {
                const next = [...list]; next[i] = { ...n, value: e.target.value }; onChange(next);
              }}
            />
            <div className="flex items-center gap-1 text-xs">
              <Switch
                checked={n.active}
                onCheckedChange={(v) => {
                  const next = [...list]; next[i] = { ...n, active: v }; onChange(next);
                }}
              />
              Show
            </div>
            <Button variant="ghost" size="icon" onClick={() => onChange(list.filter((_, x) => x !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange([...list, { value: "", active: true }])}>
          <Plus className="mr-1 h-3 w-3" /> Add Number
        </Button>
      </div>
    </div>
  );
}

// ==================== WhatsApp / Form / Terms ====================

function useSettingsForm() {
  const { settings, refresh } = useContactPageSettings();
  const [draft, setDraft] = useState<ContactPageSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => setDraft(settings), [settings]);

  async function save(patch: Partial<ContactPageSettings>) {
    setSaving(true);
    try {
      await saveContactPageSettings(patch);
      toast.success("Saved");
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
      refresh();
    } catch (e) {
      toast.error((e as Error).message || "Save failed");
    } finally { setSaving(false); }
  }
  return { draft, setDraft, saving, justSaved, save };
}

function WhatsAppEditor() {
  const { draft, setDraft, saving, justSaved, save } = useSettingsForm();
  return (
    <div className="max-w-2xl rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-primary">WhatsApp Section</h3>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Enabled</Label>
          <Switch checked={draft.whatsappEnabled} onCheckedChange={(v) => setDraft({ ...draft, whatsappEnabled: v })} />
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        <FieldRow label="Heading"><Input value={draft.whatsappHeading} onChange={(e) => setDraft({ ...draft, whatsappHeading: e.target.value })} /></FieldRow>
        <FieldRow label="Description"><Textarea value={draft.whatsappDescription} onChange={(e) => setDraft({ ...draft, whatsappDescription: e.target.value })} /></FieldRow>
        <FieldRow label="Button Label"><Input value={draft.whatsappButtonLabel} onChange={(e) => setDraft({ ...draft, whatsappButtonLabel: e.target.value })} /></FieldRow>
        <FieldRow label="WhatsApp Number (with country code, digits only)">
          <Input value={draft.whatsappNumber} onChange={(e) => setDraft({ ...draft, whatsappNumber: e.target.value.replace(/\D/g, "") })} placeholder="919844345088" />
        </FieldRow>
        <FieldRow label="Default Message"><Textarea value={draft.whatsappDefaultMessage} onChange={(e) => setDraft({ ...draft, whatsappDefaultMessage: e.target.value })} /></FieldRow>
        <Button className="w-fit" onClick={() => save({
          whatsappHeading: draft.whatsappHeading,
          whatsappDescription: draft.whatsappDescription,
          whatsappButtonLabel: draft.whatsappButtonLabel,
          whatsappNumber: draft.whatsappNumber,
          whatsappDefaultMessage: draft.whatsappDefaultMessage,
          whatsappEnabled: draft.whatsappEnabled,
        })} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : justSaved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} {justSaved ? "Saved" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

function FormSettingsEditor() {
  const { draft, setDraft, saving, justSaved, save } = useSettingsForm();
  const fs = draft.formSettings;
  const setFs = (patch: Partial<typeof fs>) => setDraft({ ...draft, formSettings: { ...fs, ...patch } });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-black text-primary">Headings & Messages</h3>
        <div className="mt-4 grid gap-3">
          <FieldRow label="Form Heading"><Input value={draft.formHeading} onChange={(e) => setDraft({ ...draft, formHeading: e.target.value })} /></FieldRow>
          <FieldRow label="Form Subheading"><Input value={draft.formSubheading} onChange={(e) => setDraft({ ...draft, formSubheading: e.target.value })} /></FieldRow>
          <FieldRow label="Submit Button Label"><Input value={draft.submitButtonLabel} onChange={(e) => setDraft({ ...draft, submitButtonLabel: e.target.value })} /></FieldRow>
          <FieldRow label="Success Message"><Textarea value={draft.successMessage} onChange={(e) => setDraft({ ...draft, successMessage: e.target.value })} /></FieldRow>
          <FieldRow label="Failure Message"><Textarea value={draft.failureMessage} onChange={(e) => setDraft({ ...draft, failureMessage: e.target.value })} /></FieldRow>
          <div className="flex items-center gap-2">
            <Switch checked={draft.formActive} onCheckedChange={(v) => setDraft({ ...draft, formActive: v })} />
            <Label>Form Active</Label>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-black text-primary">Field Labels & Placeholders</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <FieldRow label="Name Label"><Input value={fs.nameLabel} onChange={(e) => setFs({ nameLabel: e.target.value })} /></FieldRow>
          <FieldRow label="Name Placeholder"><Input value={fs.namePlaceholder} onChange={(e) => setFs({ namePlaceholder: e.target.value })} /></FieldRow>
          <FieldRow label="Phone Label"><Input value={fs.phoneLabel} onChange={(e) => setFs({ phoneLabel: e.target.value })} /></FieldRow>
          <FieldRow label="Phone Placeholder"><Input value={fs.phonePlaceholder} onChange={(e) => setFs({ phonePlaceholder: e.target.value })} /></FieldRow>
          <FieldRow label="Email Label"><Input value={fs.emailLabel} onChange={(e) => setFs({ emailLabel: e.target.value })} /></FieldRow>
          <FieldRow label="Email Placeholder"><Input value={fs.emailPlaceholder} onChange={(e) => setFs({ emailPlaceholder: e.target.value })} /></FieldRow>
          <FieldRow label="Category Label"><Input value={fs.categoryLabel} onChange={(e) => setFs({ categoryLabel: e.target.value })} /></FieldRow>
          <FieldRow label="Service Label"><Input value={fs.serviceLabel} onChange={(e) => setFs({ serviceLabel: e.target.value })} /></FieldRow>
          <FieldRow label="Location Label"><Input value={fs.locationLabel} onChange={(e) => setFs({ locationLabel: e.target.value })} /></FieldRow>
          <FieldRow label="Location Placeholder"><Input value={fs.locationPlaceholder} onChange={(e) => setFs({ locationPlaceholder: e.target.value })} /></FieldRow>
          <FieldRow label="Preferred Date Label"><Input value={fs.dateLabel} onChange={(e) => setFs({ dateLabel: e.target.value })} /></FieldRow>
          <FieldRow label="Message Label"><Input value={fs.messageLabel} onChange={(e) => setFs({ messageLabel: e.target.value })} /></FieldRow>
          <div className="sm:col-span-2">
            <FieldRow label="Message Placeholder"><Input value={fs.messagePlaceholder} onChange={(e) => setFs({ messagePlaceholder: e.target.value })} /></FieldRow>
          </div>
          <div className="sm:col-span-2">
            <FieldRow label="Agreement Checkbox Text"><Input value={fs.agreementCheckboxText} onChange={(e) => setFs({ agreementCheckboxText: e.target.value })} /></FieldRow>
          </div>
          <div className="sm:col-span-2">
            <FieldRow label="Terms Checkbox Text"><Input value={fs.termsCheckboxText} onChange={(e) => setFs({ termsCheckboxText: e.target.value })} /></FieldRow>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        <Button onClick={() => save({
          formHeading: draft.formHeading, formSubheading: draft.formSubheading,
          submitButtonLabel: draft.submitButtonLabel, successMessage: draft.successMessage,
          failureMessage: draft.failureMessage, formActive: draft.formActive,
          formSettings: draft.formSettings,
        })} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : justSaved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} {justSaved ? "Saved" : "Save Form Settings"}
        </Button>
      </div>
    </div>
  );
}

function TermsEditor() {
  const { draft, setDraft, saving, justSaved, save } = useSettingsForm();
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-black text-primary">Customer Service Agreement</h3>
        <div className="mt-4 grid gap-3">
          <FieldRow label="Title"><Input value={draft.agreementTitle} onChange={(e) => setDraft({ ...draft, agreementTitle: e.target.value })} /></FieldRow>
          <FieldRow label="Version"><Input value={draft.agreementVersion} onChange={(e) => setDraft({ ...draft, agreementVersion: e.target.value })} /></FieldRow>
          <FieldRow label="Content"><Textarea rows={10} value={draft.agreementContent} onChange={(e) => setDraft({ ...draft, agreementContent: e.target.value })} /></FieldRow>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-black text-primary">Terms and Conditions</h3>
        <div className="mt-4 grid gap-3">
          <FieldRow label="Title"><Input value={draft.termsTitle} onChange={(e) => setDraft({ ...draft, termsTitle: e.target.value })} /></FieldRow>
          <FieldRow label="Version"><Input value={draft.termsVersion} onChange={(e) => setDraft({ ...draft, termsVersion: e.target.value })} /></FieldRow>
          <FieldRow label="Content"><Textarea rows={10} value={draft.termsContent} onChange={(e) => setDraft({ ...draft, termsContent: e.target.value })} /></FieldRow>
        </div>
      </div>
      <div className="lg:col-span-2">
        <Button onClick={() => save({
          agreementTitle: draft.agreementTitle, agreementContent: draft.agreementContent, agreementVersion: draft.agreementVersion,
          termsTitle: draft.termsTitle, termsContent: draft.termsContent, termsVersion: draft.termsVersion,
        })} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : justSaved ? <Check className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} {justSaved ? "Saved" : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ==================== Social Media ====================

function SocialLinksEditor() {
  const { links, refresh } = useContactSocialLinks();
  const [drafts, setDrafts] = useState<Record<string, ContactSocialLink>>({});
  useEffect(() => {
    const d: Record<string, ContactSocialLink> = {};
    links.forEach((l) => (d[l.id] = l));
    setDrafts(d);
  }, [links]);
  const [saving, setSaving] = useState<string | null>(null);

  async function save(id: string) {
    setSaving(id);
    try { await upsertContactSocialLink(drafts[id]); toast.success("Saved"); refresh(); }
    catch (e) { toast.error((e as Error).message || "Save failed"); }
    finally { setSaving(null); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this link?")) return;
    try { await deleteContactSocialLink(id); toast.success("Deleted"); refresh(); }
    catch (e) { toast.error((e as Error).message || "Delete failed"); }
  }
  async function addNew() {
    try {
      await upsertContactSocialLink({
        platformName: "New Platform", platformKey: "custom", icon: "globe",
        url: "https://", displayOrder: (links.at(-1)?.displayOrder ?? 0) + 1,
        isActive: true, openInNewTab: true,
      });
      toast.success("Added"); refresh();
    } catch (e) { toast.error((e as Error).message || "Add failed"); }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-primary">Social Media Links</h3>
        <Button size="sm" onClick={addNew}><Plus className="mr-1 h-3 w-3" /> Add Link</Button>
      </div>
      <div className="mt-4 grid gap-4">
        {links.map((l) => {
          const d = drafts[l.id] ?? l;
          const set = (patch: Partial<ContactSocialLink>) => setDrafts({ ...drafts, [l.id]: { ...d, ...patch } });
          return (
            <div key={l.id} className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-6 md:items-end">
              <FieldRow label="Platform"><Input value={d.platformName} onChange={(e) => set({ platformName: e.target.value })} /></FieldRow>
              <FieldRow label="Icon"><Input value={d.icon} onChange={(e) => set({ icon: e.target.value })} placeholder="facebook / instagram / whatsapp…" /></FieldRow>
              <div className="md:col-span-2"><FieldRow label="URL"><Input value={d.url} onChange={(e) => set({ url: e.target.value })} /></FieldRow></div>
              <FieldRow label="Order"><Input type="number" value={d.displayOrder} onChange={(e) => set({ displayOrder: Number(e.target.value) })} /></FieldRow>
              <div className="flex items-center gap-2">
                <Switch checked={d.isActive} onCheckedChange={(v) => set({ isActive: v })} />
                <Label className="text-xs">Active</Label>
              </div>
              <div className="md:col-span-6 flex gap-2">
                <Button size="sm" onClick={() => save(l.id)} disabled={saving === l.id}>
                  {saving === l.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(l.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          );
        })}
        {!links.length && <p className="text-sm text-muted-foreground">No social links yet. Add one above.</p>}
      </div>
    </div>
  );
}

// ==================== Shared ====================

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function RedirectPanel({ title, body, to, label }: { title: string; body: string; to: string; label: string }) {
  return (
    <div className="max-w-xl rounded-2xl border border-border bg-card p-6">
      <h3 className="text-lg font-black text-primary">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <Link to={to} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
        <ExternalLink className="h-4 w-4" /> {label}
      </Link>
    </div>
  );
}