import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface AddAdminProps {
  onAdd: (name: string, email: string, role: string) => void;
}

export function AddAdmin({ onAdd }: AddAdminProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && role) {
      onAdd(name, email, role);
      setName("");
      setEmail("");
      setRole("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="admin-name">Full Name</Label>
        <Input
          id="admin-name"
          placeholder="Enter admin name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-role">Role</Label>
        <Select value={role} onValueChange={setRole} required>
          <SelectTrigger id="admin-role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Super Admin">Super Admin</SelectItem>
            <SelectItem value="Support Admin">Support Admin</SelectItem>
            <SelectItem value="Content Admin">Content Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full bg-[#6A89A7] hover:bg-[#88BDF2] text-white"
      >
        Create Admin
      </Button>
    </form>
  );
}
