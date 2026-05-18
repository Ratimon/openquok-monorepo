-- MODULE NAME: integration
-- MODULE DATE: 20260520
-- MODULE SCOPE: FK catch-up (integrations.customer_id → integration_customers)

DO $$ BEGIN
    ALTER TABLE public.integrations
        ADD CONSTRAINT integrations_customer_id_fkey
        FOREIGN KEY (customer_id)
        REFERENCES public.integration_customers(id)
        ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
