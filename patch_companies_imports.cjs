const fs = require('fs');
const path = 'src/pages/CompaniesPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "import { X, Building2, MapPin, AlertCircle, Calendar, FileText, Activity, Users, ShoppingCart, Target, MessageCircle, Clock, Link as LinkIcon, Paperclip, Sliders } from 'lucide-react'",
  "import { X, Building2, MapPin, Calendar, FileText, Activity, Users, ShoppingCart, Target, MessageCircle, Clock } from 'lucide-react'"
);

fs.writeFileSync(path, code);
