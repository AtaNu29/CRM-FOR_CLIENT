import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";

interface UpdateServiceProgressProps {
  onAdd: (service: string, title: string, description: string, progress: number) => void;
  onCancel: () => void;
}

export function UpdateServiceProgress({ onAdd, onCancel }: UpdateServiceProgressProps) {
  const [service, setService] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState([50]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (service && title && description) {
      onAdd(service, title, description, progress[0]);
      setService("");
      setTitle("");
      setDescription("");
      setProgress([50]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="service">Service Type</Label>
        <Select value={service} onValueChange={setService} required>
          <SelectTrigger id="service">
            <SelectValue placeholder="Select service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Website">Website</SelectItem>
            <SelectItem value="SEO">SEO</SelectItem>
            <SelectItem value="Social Media">Social Media</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Update Title</Label>
        <Input
          id="title"
          placeholder="e.g., Homepage redesign completed"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the update..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="progress">Progress: {progress[0]}%</Label>
        <Slider
          id="progress"
          min={0}
          max={100}
          step={5}
          value={progress}
          onValueChange={setProgress}
          className="w-full"
        />
      </div>

      <div className="flex space-x-3">
        <Button
          type="submit"
          className="flex-1 bg-[#6A89A7] hover:bg-[#88BDF2] text-white"
        >
          Add Update
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
