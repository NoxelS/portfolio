import portrait from '../../public/profile1.png?url&no-inline';
import malt from '../../public/assets/malt-logo.svg?url&no-inline';
import netcom from '../../public/assets/companies/netcom.svg?url&no-inline';
import kpmg from '../../public/assets/companies/kpmg.svg?url&no-inline';
import uds from '../../public/assets/companies/uds.svg.webp?url&no-inline';
import gip from '../../public/assets/companies/gip_logo_neg.png?url&no-inline';
import igs from '../../public/assets/companies/IGS_NiederOlm_farbig.jpg?url&no-inline';
import kuppingerCole from '../../public/assets/companies/kclogo.svg?url&no-inline';
import padua from '../../public/assets/companies/UNIPD_Marchio_STD_RED.png?url&no-inline';

// Fingerprinted /_astro/ URLs use the Node adapter's existing immutable cache
// policy. Public originals remain available for older pages and external links.
export const imageAssets = {
    portrait,
    malt,
    companies: { netcom, kpmg, uds, gip, igs, kuppingerCole, padua },
};
