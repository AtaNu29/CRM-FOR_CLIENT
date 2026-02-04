import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Loader2 } from "lucide-react";

interface AddUserDialogProps {
    type: 'admin' | 'customer';
    onAdd: (data: { name: string; email: string; role: string; password?: string }) => Promise<void>;
    onClose: () => void;
}

export function AddUserDialog({ type, onAdd, onClose }: AddUserDialogProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState(type === 'customer' ? 'customer' : '');
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onAdd({ name, email, role, password });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="user-name">Full Name</Label>
                <Input
                    id="user-name"
                    placeholder={`Enter ${type} name`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                    id="user-email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
            </div>

            {type === 'admin' && (
                <div className="space-y-2">
                    <Label htmlFor="user-role">Role</Label>
                    <Select value={role} onValueChange={setRole} required disabled={isLoading}>
                        <SelectTrigger id="user-role">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="Super Admin">Super Admin</SelectItem>
                            <SelectItem value="Support Admin">Support Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="user-password">Initial Password</Label>
                <Input
                    id="user-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                    Note: This will create the profile. You will still need to confirm the email in Supabase.
                </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={onClose} type="button" disabled={isLoading}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="bg-[#6A89A7] hover:bg-[#88BDF2] text-white"
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Create {type === 'admin' ? 'Admin' : 'Customer'}
                </Button>
            </div>
        </form>
    );
}
