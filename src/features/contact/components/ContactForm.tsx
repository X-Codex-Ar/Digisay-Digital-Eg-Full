import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, Send } from "lucide-react";

import { contactServices } from "@/data/site";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrimaryButton } from "@/components/common/PrimaryButton";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  service: z.string().min(1, "Please select a service"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-[#d90a2c] focus:outline-none focus:ring-2 focus:ring-[#d90a2c]/20";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    },
  });

  const onSubmit = (_data: FormData) => {
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-3xl border border-border/80 bg-card p-6 shadow-xl md:p-10"
      >
        <div className="border-b border-border/40 pb-4">
          <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Drop us a line
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in this form and our strategy team will reach back within 24 hours.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* First Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="firstName">
              First Name *
            </label>
            <input
              id="firstName"
              placeholder="e.g. John"
              {...register("firstName")}
              className={inputClass}
              aria-invalid={!!errors.firstName}
            />
            {errors.firstName && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="lastName">
              Last Name *
            </label>
            <input
              id="lastName"
              placeholder="e.g. Doe"
              {...register("lastName")}
              className={inputClass}
              aria-invalid={!!errors.lastName}
            />
            {errors.lastName && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="email">
              Email *
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              {...register("email")}
              className={inputClass}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone (Optional) */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="phone">
              Phone Number <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              {...register("phone")}
              className={inputClass}
            />
          </div>
        </div>

        {/* Reusable Radix Select Dropdown */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="service">
            Service of Interest *
          </label>
          <Controller
            name="service"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  id="service"
                  className="w-full h-12 rounded-2xl border border-input bg-background px-4 text-sm text-foreground shadow-sm transition-all focus:border-[#d90a2c] focus:ring-2 focus:ring-[#d90a2c]/20"
                  aria-invalid={!!errors.service}
                >
                  <SelectValue placeholder="Select a service category" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-border/80 bg-popover/95 p-1 shadow-2xl backdrop-blur-md">
                  {contactServices.map((service) => (
                    <SelectItem
                      key={service}
                      value={service}
                      className="cursor-pointer rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted focus:bg-muted focus:text-[#d90a2c]"
                    >
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.service && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
              {errors.service.message}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="message">
            Message <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="message"
            rows={5}
            placeholder="Tell us about your project, content catalog, or campaign goals..."
            {...register("message")}
            className={inputClass}
          />
        </div>

        {/* Confirmation status banner */}
        {submitted && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-300"
          >
            <CheckCircle2 className="size-5 shrink-0 text-emerald-500 mt-0.5" />
            <div>
              <p className="font-semibold">Inquiry sent successfully!</p>
              <p className="text-xs mt-0.5 opacity-90">
                Thank you for contacting DigiSay. Our team will review your message and reach out shortly.
              </p>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#d90a2c] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#d90a2c]/25 transition-all duration-300 hover:bg-[#b80824] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            <span>Send Message</span>
            <Send className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
