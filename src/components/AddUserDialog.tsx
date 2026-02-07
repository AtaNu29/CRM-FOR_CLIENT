import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { User, Shield, Loader2 } from "lucide-react";

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
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
            <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-2xl">
                <div className="p-3 bg-white rounded-xl shadow-sm text-[#6A89A7]">
                    {type === 'admin' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#384959]">User Credentials</h3>
                    <p className="text-sm text-gray-500">Enter the initial account details</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="user-name" className="text-sm font-bold text-[#384959] ml-1">Full Name</Label>
                <Input
                    id="user-name"
                    placeholder={`e.g. ${type === 'admin' ? 'John Admin' : 'Sarah Client'}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 border-gray-200 focus:ring-2 focus:ring-[#88BDF2] rounded-xl bg-white transition-all shadow-sm"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="user-email" className="text-sm font-bold text-[#384959] ml-1">Email Address</Label>
                <Input
                    id="user-email"
                    type="email"
                    placeholder="user@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 border-gray-200 focus:ring-2 focus:ring-[#88BDF2] rounded-xl bg-white transition-all shadow-sm"
                />
            </div>

            {type === 'admin' && (
                <div className="space-y-2">
                    <Label htmlFor="user-role" className="text-sm font-bold text-[#384959] ml-1">Administrative Role</Label>
                    <Select value={role} onValueChange={setRole} required disabled={isLoading}>
                        <SelectTrigger id="user-role" className="h-12 border-gray-200 rounded-xl bg-white shadow-sm">
                            <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="admin">System Admin</SelectItem>
                            <SelectItem value="Super Admin">Super Admin</SelectItem>
                            <SelectItem value="Support Admin">Support Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="user-password" className="text-sm font-bold text-[#384959] ml-1">Initial Password</Label>
                <Input
                    id="user-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="h-12 border-gray-200 focus:ring-2 focus:ring-[#88BDF2] rounded-xl bg-white transition-all shadow-sm"
                />
                <div className="flex items-center space-x-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 mt-4">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <p className="text-[11px] text-blue-600 font-medium leading-tight">
                        Security Note: This creates the database profile. Please remind users to change their password on first login.
                    </p>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <Button variant="ghost" onClick={onClose} type="button" disabled={isLoading} className="text-gray-500 hover:text-gray-700">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="min-w-[140px] h-12 bg-[#384959] hover:bg-[#2c3a47] text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Create {type === 'admin' ? 'Admin' : 'Customer'}
                </Button>
            </div>
        </form>
    );
}
