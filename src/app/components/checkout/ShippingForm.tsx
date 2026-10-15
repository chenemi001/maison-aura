import { Input, Select } from "@/app/components/ui/Input";
import { NIGERIAN_STATES } from "@/app/lib/shipping";

interface ShippingFormProps {
  values?: Record<string, string>;
  errors?: Record<string, string>;
  disabled?: boolean;
}

/** Contact and Nigerian delivery address fields (uncontrolled, with autofill hints). */
export function ShippingForm({ values = {}, errors = {}, disabled }: ShippingFormProps) {
  return (
    <div className="space-y-10">
      <fieldset disabled={disabled} className="space-y-5">
        <legend className="mb-5 font-serif text-3xl">Contact</legend>
        <Input
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={values.email}
          error={errors.email}
          hint="We'll send your order confirmation here."
        />
        <Input
          label="Phone number"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="shipping tel"
          placeholder="0803 123 4567"
          required
          defaultValue={values.phone}
          error={errors.phone}
          hint="Our courier will call this number to arrange delivery."
        />
      </fieldset>

      <fieldset disabled={disabled} className="space-y-5">
        <legend className="mb-5 font-serif text-3xl">Delivery address</legend>
        <input type="hidden" name="country" value="NG" />
        <Input
          label="Full name"
          name="fullName"
          autoComplete="shipping name"
          required
          defaultValue={values.fullName}
          error={errors.fullName}
        />
        <Input
          label="Street address"
          name="line1"
          autoComplete="shipping address-line1"
          placeholder="e.g. 12 Admiralty Way"
          required
          defaultValue={values.line1}
          error={errors.line1}
        />
        <Input
          label="Apartment, estate or landmark (optional)"
          name="line2"
          autoComplete="shipping address-line2"
          defaultValue={values.line2}
          error={errors.line2}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Town or city"
            name="city"
            autoComplete="shipping address-level2"
            placeholder="e.g. Lekki"
            required
            defaultValue={values.city}
            error={errors.city}
          />
          <Select
            label="State"
            name="state"
            autoComplete="shipping address-level1"
            required
            defaultValue={values.state || "Lagos"}
            error={errors.state}
          >
            {NIGERIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Postcode (optional)"
            name="postcode"
            inputMode="numeric"
            autoComplete="shipping postal-code"
            defaultValue={values.postcode}
            error={errors.postcode}
          />
          <Input label="Country" name="countryDisplay" value="Nigeria" readOnly disabled />
        </div>
      </fieldset>
    </div>
  );
}
